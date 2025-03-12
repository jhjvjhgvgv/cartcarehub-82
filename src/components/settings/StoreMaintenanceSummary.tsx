
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConnectionService } from "@/services/ConnectionService";
import { StoreManagerSummary, ManagedStore, StoreMaintenanceConnection } from "./types";
import { Store, UserAccount } from "@/services/connection/types";
import { Building, Users, LinkIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function StoreMaintenanceSummary() {
  const [summary, setSummary] = useState<StoreManagerSummary>({
    totalStores: 0,
    activeStores: 0,
    totalMaintenanceProviders: 0,
    pendingConnections: 0
  });
  const [selectedTab, setSelectedTab] = useState("stores");
  const [stores, setStores] = useState<ManagedStore[]>([]);
  const [connections, setConnections] = useState<StoreMaintenanceConnection[]>([]);
  const [maintenanceProviders, setMaintenanceProviders] = useState<UserAccount[]>([]);
  const currentUser = ConnectionService.getCurrentUser();

  useEffect(() => {
    // Fetch all managed stores for this store manager
    const fetchManagedStores = async () => {
      try {
        // In a real implementation, this would filter stores by the current manager ID
        const allStores = ConnectionService.getStoredConnections()
          .reduce((stores: ManagedStore[], connection) => {
            // Find store details
            const storeDetails = ConnectionService.getStoreById(connection.storeId);
            if (storeDetails) {
              const existingStore = stores.find(s => s.id === connection.storeId);
              if (!existingStore) {
                stores.push({
                  id: connection.storeId,
                  name: storeDetails.name,
                  status: "active",
                  createdAt: connection.requestedAt,
                  managerId: currentUser.id
                });
              }
            }
            return stores;
          }, []);
          
        setStores(allStores);
        
        // Calculate summary data
        const activeStores = allStores.filter(s => s.status === "active").length;
        
        // Get all maintenance providers connected to any of the stores
        const storeConnections = ConnectionService.getStoredConnections();
        
        // Get unique maintenance providers
        const uniqueProviderIds = [...new Set(storeConnections.map(conn => conn.maintenanceId))];
        const providers = uniqueProviderIds.map(id => ConnectionService.getMaintenanceById(id)).filter(Boolean) as UserAccount[];
        
        // Count pending connections
        const pendingCount = storeConnections.filter(conn => conn.status === "pending").length;
        
        // Get all store-maintenance connections
        const allConnections = storeConnections.map(conn => ({
          storeId: conn.storeId,
          maintenanceId: conn.maintenanceId,
          status: conn.status,
          connectedAt: conn.connectedAt
        })) as StoreMaintenanceConnection[];
        
        setConnections(allConnections);
        setMaintenanceProviders(providers);
        
        setSummary({
          totalStores: allStores.length,
          activeStores,
          totalMaintenanceProviders: providers.length,
          pendingConnections: pendingCount
        });
      } catch (error) {
        console.error("Error fetching store data:", error);
      }
    };
    
    fetchManagedStores();
  }, [currentUser.id]);

  const getMaintenanceProviderName = (maintenanceId: string) => {
    const provider = maintenanceProviders.find(p => p.id === maintenanceId);
    return provider ? provider.name : "Unknown Provider";
  };

  const getStoreNameById = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : "Unknown Store";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Management Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex flex-col items-center p-4 bg-secondary/20 rounded-lg">
            <Building className="h-8 w-8 text-primary mb-2" />
            <span className="text-2xl font-bold">{summary.totalStores}</span>
            <span className="text-sm text-muted-foreground">Total Stores</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-secondary/20 rounded-lg">
            <Users className="h-8 w-8 text-primary mb-2" />
            <span className="text-2xl font-bold">{summary.totalMaintenanceProviders}</span>
            <span className="text-sm text-muted-foreground">Maintenance Providers</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-secondary/20 rounded-lg">
            <LinkIcon className="h-8 w-8 text-primary mb-2" />
            <span className="text-2xl font-bold">{connections.filter(c => c.status === "active").length}</span>
            <span className="text-sm text-muted-foreground">Active Connections</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-secondary/20 rounded-lg">
            <Clock className="h-8 w-8 text-primary mb-2" />
            <span className="text-2xl font-bold">{summary.pendingConnections}</span>
            <span className="text-sm text-muted-foreground">Pending Connections</span>
          </div>
        </div>
        
        <Tabs defaultValue="stores" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="stores">Stores</TabsTrigger>
            <TabsTrigger value="connections">Maintenance Connections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stores">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Connected Providers</TableHead>
                    <TableHead>Since</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No stores found. Add stores to see them here.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stores.map((store) => {
                      const storeConnections = connections.filter(c => c.storeId === store.id);
                      const activeConnections = storeConnections.filter(c => c.status === "active").length;
                      
                      return (
                        <TableRow key={store.id}>
                          <TableCell className="font-medium">{store.name}</TableCell>
                          <TableCell>
                            <Badge variant={store.status === "active" ? "default" : "secondary"}>
                              {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{activeConnections} of {storeConnections.length}</TableCell>
                          <TableCell>{new Date(store.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="connections">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Maintenance Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Connected Since</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No connections found. Connect stores to maintenance providers to see them here.
                      </TableCell>
                    </TableRow>
                  ) : (
                    connections.map((connection, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{getStoreNameById(connection.storeId)}</TableCell>
                        <TableCell>{getMaintenanceProviderName(connection.maintenanceId)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              connection.status === "active" ? "default" : 
                              connection.status === "pending" ? "outline" : "destructive"
                            }
                          >
                            {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {connection.connectedAt 
                            ? new Date(connection.connectedAt).toLocaleDateString() 
                            : "Pending"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
