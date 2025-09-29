import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router';
import { PasswordChangeForm } from '../../components/PasswordChangeForm/PasswordChangeForm';
import { ProfileForm } from '../../components/ProfileForm/ProfileForm';

export const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  function getTab() {
    const tab = searchParams.get('tab');
    return tab || 'profile';
  }

  function setTab(tab: string) {
    searchParams.set('tab', tab);
    setSearchParams(searchParams);
  }

  return (
    <>
      <title>Profile | PROJECT_NAME</title>
      <div className="mx-auto mt-12 w-full max-w-lg px-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your profile and password</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs onValueChange={setTab} value={getTab()}>
              <TabsList className="mb-6 w-full">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <ProfileForm />
              </TabsContent>
              <TabsContent value="password">
                <PasswordChangeForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
