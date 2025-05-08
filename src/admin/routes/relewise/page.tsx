import { Container, Heading, Button, toast } from "@medusajs/ui"
import { useMutation } from "@tanstack/react-query"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { defineRouteConfig } from "@medusajs/admin-sdk"

const queryClient = new QueryClient()

const RelewiseContent = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: () => 
      sdk.client.fetch("/admin/relewise/sync", {
        method: "POST",
      }),
    onSuccess: () => {
      toast.success("Successfully triggered data sync to Relewise") 
    },
    onError: (err) => {
      console.error(err)
      toast.error("Failed to sync data to Relewise") 
    },
  })

  const handleSync = () => {
    mutate()
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Relewise Sync</Heading>
      </div>
      <div className="px-6 py-8">
        <Button 
          variant="primary"
          onClick={handleSync}
          isLoading={isPending}
        >
          Sync all Products to Relewise
        </Button>
      </div>
    </Container>
  )
}

const RelewisePage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RelewiseContent />
    </QueryClientProvider>
  )
}

export const config = defineRouteConfig({
  label: "Relewise",
})

export default RelewisePage