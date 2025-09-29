import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router';

export const NotFound = () => {
  return (
    <>
      <title>Page Not Found | Schedule Builder</title>
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
