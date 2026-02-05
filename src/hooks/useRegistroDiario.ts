import { useState } from 'react';
import { RegistroDiario, Donacion, Firma, FacturaElectronica, ItemFactura } from '@/types';

export const useRegistroDiario = () => {
  const [registros, setRegistros] = useState<RegistroDiario[]>([]);
  const [itemsFacturas, setItemsFacturas] = useState<ItemFactura[]>([]);
  const [registroActual, setRegistroActual] = useState<RegistroDiario>({
    fecha: new Date().toISOString().split('T')[0],
    ubicacion: '',
    tipoParqueadero: 'carros', // NUEVO: valor por defecto
    donaciones: { valor: 0, cantidadDonantes: 0 },
    facturaElectronica: { valor: 0, cantidadPersonas: 0 },
    firmas: {
      trabajador: null,
      supervisor: null,
      responsable: null
    }
  });

  const handleInputChange = (field: keyof RegistroDiario, value: any) => {
    setRegistroActual(prev => ({ ...prev, [field]: value }));
  };

  const handleDonacionChange = (field: keyof Donacion, value: number) => {
    setRegistroActual(prev => ({
      ...prev,
      donaciones: { ...prev.donaciones, [field]: value }
    }));
  };

  const handleFacturaChange = (field: keyof FacturaElectronica, value: number) => {
    setRegistroActual(prev => ({
      ...prev,
      facturaElectronica: { ...prev.facturaElectronica!, [field]: value }
    }));
  };

  const handleItemsFacturasChange = (items: ItemFactura[]) => {
    setItemsFacturas(items);
  };

  // CORREGIDO: Ahora recibe directamente el objeto Firma
  const handleFirmaChange = (
    tipo: 'trabajador' | 'supervisor' | 'responsable', 
    firma: Firma | null
  ) => {
    setRegistroActual(prev => ({
      ...prev,
      firmas: { ...prev.firmas, [tipo]: firma }
    }));
  };

  const agregarRegistro = (): boolean => {
    if (!registroActual.ubicacion || 
        registroActual.donaciones.valor <= 0 || 
        registroActual.donaciones.cantidadDonantes <= 0) {
      return false;
    }

    setRegistros(prev => [...prev, registroActual]);
    
    setRegistroActual({
      fecha: registroActual.fecha,
      ubicacion: '',
      tipoParqueadero: registroActual.tipoParqueadero,
      donaciones: { valor: 0, cantidadDonantes: 0 },
      facturaElectronica: { valor: 0, cantidadPersonas: 0 },
      firmas: registroActual.firmas
    });

    return true;
  };

  const eliminarRegistro = (index: number) => {
    setRegistros(prev => prev.filter((_, i) => i !== index));
  };

  const reiniciarFormulario = () => {
    setRegistros([]);
    setItemsFacturas([]);
    setRegistroActual({
      fecha: new Date().toISOString().split('T')[0],
      ubicacion: '',
      tipoParqueadero: 'carros', // NUEVO
      donaciones: { valor: 0, cantidadDonantes: 0 },
      facturaElectronica: { valor: 0, cantidadPersonas: 0 },
      firmas: {
        trabajador: null,
        supervisor: null,
        responsable: null
      }
    });
  };

  return {
    registros,
    registroActual,
    itemsFacturas,
    handleInputChange,
    handleDonacionChange,
    handleFacturaChange,
    handleItemsFacturasChange,
    handleFirmaChange,
    agregarRegistro,
    eliminarRegistro,
    reiniciarFormulario
  };
};