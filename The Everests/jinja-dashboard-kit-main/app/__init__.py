# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""


from flask import Flask

app = Flask(__name__)

# Import views to register routes
from app import views
