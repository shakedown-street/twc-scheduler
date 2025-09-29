import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router';

export const NotFound = () => {
  return (
    <>
      <title>Page Not Found | PROJECT_NAME</title>
      <div className="mx-auto my-12 w-full max-w-sm px-4">
        <Card>
          <CardHeader>
            <CardTitle>Page Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link to="/">Go home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
