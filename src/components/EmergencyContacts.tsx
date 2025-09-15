import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Phone, 
  MessageSquare, 
  Edit, 
  Trash2,
  Heart,
  Users,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  id: number;
  name: string;
  phone: string;
  relationship: string;
  priority: 'high' | 'medium' | 'low';
}

const EmergencyContacts = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 1,
      name: "Sarah Johnson",
      phone: "+1 (555) 123-4567",
      relationship: "Sister",
      priority: "high"
    },
    {
      id: 2,
      name: "Mom",
      phone: "+1 (555) 987-6543",
      relationship: "Mother",
      priority: "high"
    },
    {
      id: 3,
      name: "Alex Chen",
      phone: "+1 (555) 456-7890",
      relationship: "Best Friend",
      priority: "medium"
    }
  ]);

  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    relationship: "",
    priority: "medium" as const
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      const contact: Contact = {
        id: Date.now(),
        ...newContact
      };
      setContacts([...contacts, contact]);
      setNewContact({ name: "", phone: "", relationship: "", priority: "medium" });
      setIsAddDialogOpen(false);
      toast({
        title: "Contact Added",
        description: `${newContact.name} has been added to your emergency contacts.`,
      });
    }
  };

  const handleCall = (contact: Contact) => {
    toast({
      title: `Calling ${contact.name}`,
      description: "Connecting...",
    });
  };

  const handleMessage = (contact: Contact) => {
    toast({
      title: `Messaging ${contact.name}`,
      description: "Opening messaging app...",
    });
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Heart className="h-3 w-3" />;
      case 'medium':
        return <Users className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive';
      case 'medium':
        return 'bg-warning';
      default:
        return 'bg-muted';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Emergency Contacts</span>
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Emergency Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="Enter contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                    placeholder="e.g., Sister, Friend, Colleague"
                  />
                </div>
                <Button onClick={handleAddContact} className="w-full">
                  Add Contact
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {contact.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-sm">{contact.name}</h3>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getPriorityColor(contact.priority)} text-white`}
                  >
                    <div className="flex items-center space-x-1">
                      {getPriorityIcon(contact.priority)}
                      <span>{contact.priority}</span>
                    </div>
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{contact.phone}</p>
                <p className="text-xs text-muted-foreground">{contact.relationship}</p>
              </div>
            </div>
            
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMessage(contact)}
                className="h-8 w-8 p-0"
              >
                <MessageSquare className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                onClick={() => handleCall(contact)}
                className="h-8 w-8 p-0"
              >
                <Phone className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        
        {contacts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No emergency contacts added yet</p>
            <p className="text-xs">Add contacts to notify in case of emergency</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencyContacts;