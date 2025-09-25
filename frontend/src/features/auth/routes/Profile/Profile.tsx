import { Card, Container, TabItem, Tabs } from '@/ui';
import React from 'react';
import { Helmet } from 'react-helmet';
import { PasswordChangeForm } from '../../components/PasswordChangeForm/PasswordChangeForm';
import { ProfileForm } from '../../components/ProfileForm/ProfileForm';

export const Profile = () => {
  const [selectedTab, setSelectedTab] = React.useState<'profile' | 'password'>('profile');

  return (
    <>
      <Helmet>
        <title>Profile | Schedule Builder</title>
      </Helmet>
      <Container>
        <div className="centerPage">
          <Card className="p-0" fluid>
            <Tabs fluid>
              <TabItem
                active={selectedTab === 'profile'}
                onClick={() => {
                  setSelectedTab('profile');
                }}
              >
                Profile
              </TabItem>
              <TabItem
                active={selectedTab === 'password'}
                onClick={() => {
                  setSelectedTab('password');
                }}
              >
                Password
              </TabItem>
            </Tabs>
            <div className="p-6">
              {selectedTab === 'profile' && <ProfileForm />}
              {selectedTab === 'password' && (
                <>
                  <PasswordChangeForm />
                </>
              )}
            </div>
          </Card>
        </div>
      </Container>
    </>
  );
};
