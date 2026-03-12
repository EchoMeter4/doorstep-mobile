export const currentUser = {
  id: 1,
  name: "Carlos Mendoza",
  email: "carlos@doorstep.mx",
  role: "Seguridad",
  enabled: true,
};

export const zones = [
  { id: 1, name: "Edificio A", type: "pedestrian" },
  { id: 2, name: "Estacionamiento Norte", type: "vehicular" },
  { id: 3, name: "Sala de Servidores", type: "pedestrian" },
  { id: 4, name: "Acceso Principal", type: "mixed" },
];

export const recentAccesses = [
  { id: 1, name: "María García", zone: "Edificio A", status: "authorized", time: "08:42" },
  { id: 2, name: "Juan Pérez", zone: "Estacionamiento Norte", status: "denied", time: "09:15" },
  { id: 3, name: "Ana López", zone: "Acceso Principal", status: "authorized", time: "09:33" },
  { id: 4, name: "Roberto Silva", zone: "Sala de Servidores", status: "authorized", time: "10:01" },
];
