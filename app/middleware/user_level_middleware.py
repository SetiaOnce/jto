from django.shortcuts import redirect

class UserLevelMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # level_permissions = {
        #     '/pendataan': [1, 4],
        #     '/penimbangan': [2, 4],
        #     '/penindakan': [3, 4],
        # }

        # path = request.path
        # if path in level_permissions:
        #     if not request.user.is_authenticated:
        #         return redirect('auth')
            
        #     # Periksa level pengguna
        #     user_level = getattr(request.user, 'level_id', None)
        #     allowed_levels = level_permissions[path]
        #     if user_level not in allowed_levels:
        #         return redirect('auth')

        response = self.get_response(request)
        return response
