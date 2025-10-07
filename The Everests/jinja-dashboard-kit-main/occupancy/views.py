from rest_framework.permissions import AllowAny

# Store Xero tokens in memory for demo (replace with DB or session in production)
xero_tokens = {}

# API endpoint to fetch Xero P&L actuals for Jan-Dec 2025
from rest_framework.views import APIView
class XeroActualsView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        import requests
        # Use stored access token (in production, use DB/session)
        access_token = xero_tokens.get('access_token')
        tenant_id = xero_tokens.get('tenant_id')
        if not access_token or not tenant_id:
            return Response({'error': 'Not authenticated with Xero'}, status=401)
        # Fetch P&L report for Jan-Nov (periods=11)
        url_jan_nov = "https://api.xero.com/api.xro/2.0/Reports/ProfitAndLoss?fromDate=2025-01-01&periods=11&timeframe=MONTH"
        url_dec = "https://api.xero.com/api.xro/2.0/Reports/ProfitAndLoss?fromDate=2025-12-01&toDate=2025-12-31&timeframe=MONTH"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'xero-tenant-id': tenant_id,
            'Accept': 'application/json',
        }
        # Fetch Jan-Nov
        resp_jan_nov = requests.get(url_jan_nov, headers=headers)
        if resp_jan_nov.status_code != 200:
            return Response({'error': f'Xero API error (Jan-Nov): {resp_jan_nov.text}'}, status=400)
        data_jan_nov = resp_jan_nov.json()
        # Fetch Dec
        resp_dec = requests.get(url_dec, headers=headers)
        if resp_dec.status_code != 200:
            return Response({'error': f'Xero API error (Dec): {resp_dec.text}'}, status=400)
        data_dec = resp_dec.json()

        # DEBUG: Print raw Xero API responses and all account codes found
        import logging
        logger = logging.getLogger("django")
        logger.warning("Xero Jan-Nov API response: %s", data_jan_nov)
        logger.warning("Xero Dec API response: %s", data_dec)
        # Parse monthly actuals by Xero account code
        actuals_by_code = {}
        try:
            # Parse Jan-Nov
            rows_jan_nov = data_jan_nov['Reports'][0]['Rows']
            for row in rows_jan_nov:
                if row.get('RowType') == 'Section':
                    for subrow in row.get('Rows', []):
                        if subrow.get('RowType') == 'Row':
                            cells = subrow.get('Cells', [])
                            # Xero account code is usually in the first cell's Attributes
                            account_code = None
                            if 'Attributes' in cells[0]:
                                for attr in cells[0]['Attributes']:
                                    if attr.get('Name') == 'AccountCode':
                                        account_code = attr.get('Value')
                            if not account_code:
                                continue  # skip if no account code
                            monthly = [float(c.get('Value', 0) or 0) for c in cells[1:12]]  # Jan-Nov
                            actuals_by_code[account_code] = monthly
            # Parse Dec and append to each account code
            rows_dec = data_dec['Reports'][0]['Rows']
            for row in rows_dec:
                if row.get('RowType') == 'Section':
                    for subrow in row.get('Rows', []):
                        if subrow.get('RowType') == 'Row':
                            cells = subrow.get('Cells', [])
                            account_code = None
                            if 'Attributes' in cells[0]:
                                for attr in cells[0]['Attributes']:
                                    if attr.get('Name') == 'AccountCode':
                                        account_code = attr.get('Value')
                            if not account_code:
                                continue  # skip if no account code
                            dec_value = float(cells[1].get('Value', 0) or 0) if len(cells) > 1 else 0
                            if account_code in actuals_by_code:
                                actuals_by_code[account_code].append(dec_value)
                            else:
                                actuals_by_code[account_code] = [0]*11 + [dec_value]
        except Exception as e:
            return Response({'error': f'Parse error: {str(e)}'}, status=500)

        # Now, build a response mapping for only the budgets in the DB for this centre
        from .models import Budget, Centre
        centre_id = request.GET.get('centre_id')
        if centre_id:
            try:
                centre = Centre.objects.get(id=centre_id)
            except Centre.DoesNotExist:
                return Response({'error': 'Centre not found'}, status=404)
            budgets = Budget.objects.filter(centre=centre, year=2025)
        else:
            budgets = Budget.objects.filter(year=2025)
        # Map actuals to budgets by xero_account_code
        actuals = {}
        for budget in budgets:
            code = budget.xero_account_code
            if code:
                actuals[code] = actuals_by_code.get(code, [0]*12)
        return Response({'actuals': actuals})


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Occupancy, Centre, Budget
from .serializers import OccupancySerializer, BudgetSerializer

# Xero OAuth2 imports
from django.conf import settings
from django.shortcuts import redirect
from django.http import HttpResponse, HttpResponseBadRequest
from xero_python.api_client import ApiClient
from xero_python.identity import IdentityApi
from xero_python.api_client.oauth2 import OAuth2Token
import urllib.parse
# Xero OAuth2: Start login
def xero_login(request):
    print("--- XERO LOGIN CALLED ---")
    import urllib.parse
    client_id = settings.XERO_CLIENT_ID
    redirect_uri = settings.XERO_REDIRECT_URI
    scope = "offline_access accounting.reports.read accounting.transactions.read accounting.settings.read"
    authorize_url = (
        "https://login.xero.com/identity/connect/authorize?response_type=code"
        f"&client_id={urllib.parse.quote_plus(client_id)}"
        f"&redirect_uri={urllib.parse.quote_plus(redirect_uri)}"
        f"&scope={urllib.parse.quote_plus(scope)}"
        f"&state=xyz"
    )
    print(f"XERO_CLIENT_ID: {client_id}")
    print(f"XERO_REDIRECT_URI: {redirect_uri}")
    print(f"Xero OAuth2 authorize_url: {authorize_url}")
    # Write to file for Heroku debugging
    try:
        with open('/tmp/xero_auth_url.txt', 'w') as f:
            f.write(f"XERO_CLIENT_ID: {client_id}\n")
            f.write(f"XERO_REDIRECT_URI: {redirect_uri}\n")
            f.write(f"Xero OAuth2 authorize_url: {authorize_url}\n")
    except Exception as e:
        print(f"Failed to write authorize_url to file: {e}")
    return redirect(authorize_url)

# Xero OAuth2: Callback
from django.views.decorators.csrf import csrf_exempt
import requests

@csrf_exempt
def xero_callback(request):
    code = request.GET.get('code')
    if not code:
        return HttpResponseBadRequest('Missing code parameter')
    # Exchange code for tokens
    token_url = "https://identity.xero.com/connect/token"
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': settings.XERO_REDIRECT_URI,
        'client_id': settings.XERO_CLIENT_ID,
        'client_secret': settings.XERO_CLIENT_SECRET,
    }
    resp = requests.post(token_url, data=data)
    if resp.status_code != 200:
        return HttpResponse(f"Token exchange failed: {resp.text}", status=400)
    tokens = resp.json()
    # Fetch tenant ID
    access_token = tokens.get('access_token')
    if not access_token:
        return HttpResponse("No access token returned", status=400)
    orgs_url = "https://api.xero.com/connections"
    orgs_resp = requests.get(orgs_url, headers={"Authorization": f"Bearer {access_token}"})
    if orgs_resp.status_code != 200:
        return HttpResponse(f"Failed to fetch Xero tenant: {orgs_resp.text}", status=400)
    orgs = orgs_resp.json()
    if not orgs:
        return HttpResponse("No Xero tenants found", status=400)
    tenant_id = orgs[0]['tenantId']
    # Store tokens in memory (replace with DB/session in production)
    xero_tokens['access_token'] = access_token
    xero_tokens['tenant_id'] = tenant_id
    return HttpResponse("Xero connected! You can now fetch actuals from the API.")

class OccupancyByMonthView(APIView):
    def get(self, request):
        month_year = request.GET.get('month_year')
        if not month_year:
            return Response({'error': 'month_year parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        # Accept both MM-YYYY and YYYY-MM formats
        queryset = Occupancy.objects.filter(month_year=month_year)
        if queryset.count() == 0:
            # Try alternate format if no results
            if '-' in month_year:
                parts = month_year.split('-')
                if len(parts) == 2 and len(parts[0]) == 2 and len(parts[1]) == 4:
                    alt_format = f"{parts[1]}-{parts[0]}"
                    queryset = Occupancy.objects.filter(month_year=alt_format)
        serializer = OccupancySerializer(queryset, many=True)
        return Response(serializer.data)


# New API endpoint for overdue invoices
class OverdueInvoicesView(APIView):
    def get(self, request):
        data = [
            {
                "centre_name": c.name,
                "overdue_invoice_amount": c.overdue_invoice_amount or "0.00"
            }
            for c in Centre.objects.all()
        ]
        return Response(data)


# API endpoint for budgets
class BudgetListView(APIView):
    def get(self, request):
        centre = request.GET.get('centre')
        year = request.GET.get('year')
        queryset = Budget.objects.all()
        if centre:
            queryset = queryset.filter(centre__name=centre)
        if year:
            queryset = queryset.filter(year=year)
        serializer = BudgetSerializer(queryset, many=True)
        return Response(serializer.data)
