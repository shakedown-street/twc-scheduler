from django_filters import rest_framework as filters

from apps.accounts.models import EmailUser


class EmailUserFilter(filters.FilterSet):
    search = filters.CharFilter(method="search_filter", label="Search")

    class Meta:
        model = EmailUser
        fields = ("search",)

    def search_filter(self, queryset, name, value):
        return queryset.filter(email__icontains=value)
