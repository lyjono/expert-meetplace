
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import {
  createProviderService,
  getProviderServices,
  updateProviderService,
  deleteProviderService,
  getProviderPaymentSettings,
  updateProviderPaymentSettings,
  type ProviderService
} from '@/services/payments';

const Pricing = () => {
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ProviderService | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('60');
  const [stripeAccountId, setStripeAccountId] = useState('');
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [requireDeposit, setRequireDeposit] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState('50');

  const queryClient = useQueryClient();

  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['providerServices'],
    queryFn: getProviderServices,
  });

  const { data: paymentSettings } = useQuery({
    queryKey: ['providerPaymentSettings'],
    queryFn: getProviderPaymentSettings,
  });

  useEffect(() => {
    if (paymentSettings) {
      setStripeAccountId(paymentSettings.stripe_account_id || '');
      setPaymentEnabled(paymentSettings.payment_enabled || false);
      setRequireDeposit(paymentSettings.require_deposit || false);
      setDepositPercentage(paymentSettings.deposit_percentage?.toString() || '50');
    }
  }, [paymentSettings]);

  const createServiceMutation = useMutation({
    mutationFn: () => createProviderService(serviceName, description, parseFloat(price), parseInt(duration)),
    onSuccess: () => {
      toast.success('Service created successfully');
      resetForm();
      setIsServiceDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['providerServices'] });
    },
    onError: () => {
      toast.error('Failed to create service');
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: (updates: Partial<ProviderService>) => 
      updateProviderService(editingService!.id, updates),
    onSuccess: () => {
      toast.success('Service updated successfully');
      resetForm();
      setIsServiceDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['providerServices'] });
    },
    onError: () => {
      toast.error('Failed to update service');
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: deleteProviderService,
    onSuccess: () => {
      toast.success('Service deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['providerServices'] });
    },
    onError: () => {
      toast.error('Failed to delete service');
    },
  });

  const updatePaymentSettingsMutation = useMutation({
    mutationFn: () => updateProviderPaymentSettings({
      stripe_account_id: stripeAccountId,
      payment_enabled: paymentEnabled,
      require_deposit: requireDeposit,
      deposit_percentage: parseInt(depositPercentage),
    }),
    onSuccess: () => {
      toast.success('Payment settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['providerPaymentSettings'] });
    },
    onError: () => {
      toast.error('Failed to update payment settings');
    },
  });

  const resetForm = () => {
    setServiceName('');
    setDescription('');
    setPrice('');
    setDuration('60');
    setEditingService(null);
  };

  const handleEditService = (service: ProviderService) => {
    setEditingService(service);
    setServiceName(service.service_name);
    setDescription(service.description || '');
    setPrice(service.price_per_session.toString());
    setDuration(service.duration_minutes.toString());
    setIsServiceDialogOpen(true);
  };

  const handleSubmitService = () => {
    if (!serviceName || !price) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingService) {
      updateServiceMutation.mutate({
        service_name: serviceName,
        description,
        price_per_session: parseFloat(price),
        duration_minutes: parseInt(duration),
      });
    } else {
      createServiceMutation.mutate();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pricing & Payments</h1>
            <p className="text-muted-foreground">Manage your services and payment settings</p>
          </div>
        </div>

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList>
            <TabsTrigger value="services">Services & Pricing</TabsTrigger>
            <TabsTrigger value="settings">Payment Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Services</h2>
              <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingService ? 'Edit Service' : 'Add New Service'}
                    </DialogTitle>
                    <DialogDescription>
                      Set up your service details and pricing
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="service-name">Service Name</Label>
                      <Input
                        id="service-name"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        placeholder="e.g., Business Consultation"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what this service includes..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price">Price per Session ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          placeholder="60"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitService} disabled={createServiceMutation.isPending || updateServiceMutation.isPending}>
                      {editingService ? 'Update' : 'Create'} Service
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {isLoadingServices ? (
                <p>Loading services...</p>
              ) : services.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <DollarSign className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No services added yet. Create your first service to start accepting payments.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                services.map((service) => (
                  <Card key={service.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{service.service_name}</h3>
                            <Badge variant={service.is_active ? "default" : "secondary"}>
                              {service.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          {service.description && (
                            <p className="text-muted-foreground">{service.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>${service.price_per_session}</span>
                            <span>•</span>
                            <span>{service.duration_minutes} minutes</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditService(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteServiceMutation.mutate(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Configure how you receive payments from clients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Payments</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow clients to pay for appointments through the platform
                    </p>
                  </div>
                  <Switch
                    checked={paymentEnabled}
                    onCheckedChange={setPaymentEnabled}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="stripe-account">Stripe Account ID</Label>
                  <Input
                    id="stripe-account"
                    value={stripeAccountId}
                    onChange={(e) => setStripeAccountId(e.target.value)}
                    placeholder="acct_xxxxxxxxxx"
                  />
                  <p className="text-xs text-muted-foreground">
                    Connect your Stripe account to receive payments
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Deposit</Label>
                    <p className="text-sm text-muted-foreground">
                      Require clients to pay a deposit when booking
                    </p>
                  </div>
                  <Switch
                    checked={requireDeposit}
                    onCheckedChange={setRequireDeposit}
                  />
                </div>

                {requireDeposit && (
                  <div className="grid gap-2">
                    <Label htmlFor="deposit-percentage">Deposit Percentage</Label>
                    <Input
                      id="deposit-percentage"
                      type="number"
                      value={depositPercentage}
                      onChange={(e) => setDepositPercentage(e.target.value)}
                      placeholder="50"
                      min="1"
                      max="100"
                    />
                    <p className="text-xs text-muted-foreground">
                      Percentage of the total service price required as deposit
                    </p>
                  </div>
                )}

                <Button 
                  onClick={() => updatePaymentSettingsMutation.mutate()}
                  disabled={updatePaymentSettingsMutation.isPending}
                >
                  Save Payment Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Pricing;
