from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.http import HttpResponse, JsonResponse
from django.contrib import messages 
from django.utils import timezone
# from app.models import (
#     GeneralInfo, 
#     Service, 
#     Testimonial,
#     FrequentlyAskedQuestion,
#     ContactFormLog
# )
import threading, serial, time, random

def index(request):
    # READ
    # all_records = GeneralInfo.objects.all()
    # for i in all_records:
    #     print(i.company_name)

    # first_record = GeneralInfo.objects.all().order_by('-id')[:5]
    # for i in first_record:
    #     print(i.company_name)

    # filters = GeneralInfo.objects.filter(company_name__contains='Tri Cipta Internasional', location='Jakarta Selatan, Jakarta, Indonesia')
    # print(filters)
    
    # exclude = GeneralInfo.objects.exclude(company_name='Tri Cipta Internasional')
    # print(exclude)
    
    # DELETE
    # GeneralInfo.objects.filter(company_name='Tri Cipta Internasional').delete()
    
    # UPDATE
    # data = {
    #     'phone': '081280757473',
    #     'company_name': 'Tri Cipta Internasional',
    # }
    # updateone = GeneralInfo.objects.filter(id=2).update(**data)

    # CREATE
    # GeneralInfo.objects.create(
    #     company_name = "Aplle Store",
    #     location = "China",
    #     phone = "0000",
    #     email = "example.gmail.com"
    # )
    
    # file_path = 'sql_queries.txt'
    # write_sql_queries_to_file(file_path)
    
    # general_info = GeneralInfo.objects.first()
    # services = Service.objects.order_by('-id')[:6]
    # testimonials = Testimonial.objects.order_by('-id')
    # faqs = FrequentlyAskedQuestion.objects.order_by('-id')
    context ={
        # 'general_info': general_info,
        # 'services': services,
        # 'testimonials': testimonials,
        # 'faqs': faqs,
    }
    
    return render(request, 'index.html', context)
def contact_form(request):
    if request.method == 'POST':
        context ={
            'name': request.POST.get('name'),
            'email': request.POST.get('email'),
            'subject': request.POST.get('subject'),
            'message': request.POST.get('message'),
        }

        is_success, is_error, error_message = False, False, ''
        try:
            send_mail(
                subject = request.POST.get('subject'),
                message = None,
                html_message = render_to_string('email.html', context),
                from_email = settings.EMAIL_HOST_USER,
                recipient_list = [settings.EMAIL_HOST_USER],
                fail_silently = False
            )
        except Exception as e:
            is_error = True
            error_message = str(e)
            messages.error(request, "The is an error, could not send email")
        else:
            is_success = True
            messages.success(request, "Email has been sent")
        
        ContactFormLog.objects.create(
            name = request.POST.get('name'),
            email = request.POST.get('email'),
            subject = request.POST.get('subject'),
            message = request.POST.get('message'),
            action_time = timezone.now(),
            is_success = is_success,
            is_error = is_error,
            error_message = error_message,
        )
        
        return redirect('index')

    if request.method == 'GET':
        return HttpResponse('Method is POST')