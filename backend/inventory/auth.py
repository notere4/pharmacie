from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.get_username()
        token['groups'] = list(user.groups.values_list('name', flat=True))
        token['is_admin'] = user.is_superuser or user.is_staff or user.groups.filter(name='Admin').exists()
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.get_username(),
            'groups': list(self.user.groups.values_list('name', flat=True)),
            'is_admin': self.user.is_superuser or self.user.is_staff or self.user.groups.filter(name='Admin').exists(),
            'permissions': sorted(list(self.user.get_all_permissions())),
        }
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'user': {
                'id': user.id,
                'username': user.get_username(),
                'groups': list(user.groups.values_list('name', flat=True)),
                'is_admin': user.is_superuser or user.is_staff or user.groups.filter(name='Admin').exists(),
                'permissions': sorted(list(user.get_all_permissions())),
            }
        })
