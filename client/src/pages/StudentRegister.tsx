import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StudentRegister() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Student Registration</CardTitle>
          <CardDescription>Registration is managed by the school administration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              Student accounts are created by the school administration after your admission application is reviewed and approved.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              To apply for admission, visit our homepage and complete the admission form. Once approved, you will receive your registration number and login credentials.
            </p>
            <p className="text-sm text-muted-foreground">
              If you have already been approved and need help logging in, please contact your school administrator.
            </p>
          </div>

          <div className="space-y-2">
            <Button onClick={() => setLocation('/#admission')} className="w-full">
              Apply for Admission on Homepage
            </Button>
            <Button variant="outline" onClick={() => setLocation('/student-login')} className="w-full">
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
