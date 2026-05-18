from django.db import models

class Service(models.Model):
    name = models.CharField(max_length=100)
    price = models.IntegerField()
    duration = models.IntegerField(help_text="Durasi dalam menit", default=30)

    def __str__(self):
        return self.name