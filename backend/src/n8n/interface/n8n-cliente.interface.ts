/**
 * Interfaz que define la estructura exacta del JSON que se enviará
 * al Webhook de n8n.
 */
export interface N8nClienteOnboardingPayload {
    id_cliente_interno: string; 

    Nombre: string;
    Apellidos: string;
    "Fecha de nacimiento": string; 
    Domicilio?: string;
    
    // Contactos Familiares
    "Nombre del padre"?: string;
    "Email padre"?: string;
    "Telefono padre"?: number;
    "Nombre madre"?: string;
    "Email madre"?: string;
    "Telefono madre"?: number;
    "Otro contacto nombre"?: string;
    "Otro contacto email"?: string;
    "Otro contacto telefono"?: number;
    
    // Datos del Centro
    "Curso escolar"?: string;
    "Nombre del centro"?: string;
    "Dirección colegio"?: string;
    
    // Ficha de adaptaciones y tratamientos
    Adaptaciones?: string[]; 
    "Tipo adaptaciones"?: string;
    Diagnóstico?: string;
    "Otros tratamientos"?: string;
    Medicación?: string;
    Alergias?: string;
    "Numero de sesiones"?: string[]; 

    // Contactos del Colegio
    "Contacto Colegio 1"?: string;
    "Relacion contacto colegio 1"?: string;
    "Email contacto colegio 1"?: string;
    "Contacto Colegio 2"?: string;
    "Relacion contacto 2"?: string;
    "Email contacto colegio 2"?: string;
}