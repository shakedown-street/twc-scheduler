import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PasswordChangeForm } from '../../components/PasswordChangeForm/PasswordChangeForm';
import { ProfileForm } from '../../components/ProfileForm/ProfileForm';

export const Profile = () => {
  return (
    <>
      <title>Profile | PROJECT_NAME</title>
      <div className="mx-auto my-12 w-full max-w-lg px-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList className="mb-4 w-full">
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
