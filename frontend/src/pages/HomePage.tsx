import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Monitor, FlaskConical } from 'lucide-react'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          NIfTI Viewer
        </h1>
        <p className="text-muted-foreground text-lg">
          Liver Metastasis Assessment Tool
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
        <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => navigate('/local')}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
              <Monitor className="w-10 h-10 text-foreground" />
            </div>
            <CardTitle className="text-2xl">Local Mode</CardTitle>
            <CardDescription className="text-muted-foreground">
              View NIfTI files from your computer
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li>Load local .nii or .nii.gz files</li>
              <li>Drag & drop support</li>
              <li>No server required</li>
            </ul>
            <Button variant="secondary" className="w-full">
              Open Local Viewer
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => navigate('/research')}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
              <FlaskConical className="w-10 h-10 text-foreground" />
            </div>
            <CardTitle className="text-2xl">Research Mode</CardTitle>
            <CardDescription className="text-muted-foreground">
              Structured assessment workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li>Random case selection</li>
              <li>Record metastasis findings</li>
              <li>Mark lesion locations</li>
            </ul>
            <Button variant="secondary" className="w-full">
              Enter Research Mode
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="mt-12 text-sm text-muted-foreground">
        For research purposes only
      </p>
    </div>
  )
}
