from django.contrib import admin
from .models import Service # Import model yang tadi lu buat

# Ini perintah buat "manggil" dia ke dashboard admin
admin.site.register(Service)