import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router';

export const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Schedule Builder</title>
      </Helmet>
      <div className="container mx-auto px-4">
        <div className="centerPage">
          <Card>
            <CardHeader>
              <CardTitle>Page Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/">Go home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
