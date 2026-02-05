import React from 'react';
import { RegistroDiario, Donacion, Firma, FacturaElectronica, ItemFactura } from '@/types';
import { useFirmas } from '@/hooks/UseFirmas';
import { calcularValorPorDonante } from '@/utils/calculosInforme';
import { SeccionFacturasElectronicas } from '@/components/SeccionFacturasElectronicas';

interface FormularioRegistroProps {
  registroActual: RegistroDiario;
  itemsFacturas: ItemFactura[];
  onInputChange: (field: keyof RegistroDiario, value: any) => void;
  onDonacionChange: (field: keyof Donacion, value: number) => void;
  onFacturaChange: (field: keyof FacturaElectronica, value: number) => void;
  onItemsFacturasChange: (items: ItemFactura[]) => void;
  onFirmaChange: (tipo: 'trabajador' | 'supervisor' | 'responsable', firma: Firma | null) => void;
}

export const FormularioRegistro: React.FC<FormularioRegistroProps> = ({
  registroActual,
  itemsFacturas,
  onInputChange,
  onDonacionChange,
  onFacturaChange,
  onItemsFacturasChange,
  onFirmaChange
}) => {
  const { firmas, loading, error } = useFirmas();

  // Handler para cambio de firma desde el select
  const handleSelectFirma = (
    tipo: 'trabajador' | 'supervisor' | 'responsable',
    nombreFirma: string
  ) => {
    const firma = firmas[tipo]?.find(f => f.nombre === nombreFirma) || null;
    onFirmaChange(tipo, firma);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando firmas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">❌ Error: {error}</p>
        <p className="text-sm text-red-500 mt-2">
          Verifica tu configuración de Cloudinary
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fecha, Ubicación y Tipo de Parqueadero - GRID 3 COLUMNAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Fecha</label>
          <input
            type="date"
            value={registroActual.fecha}
            onChange={(e) => onInputChange('fecha', e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Nombre del Parqueadero
          </label>
          <input
            type="text"
            value={registroActual.ubicacion}
            onChange={(e) => onInputChange('ubicacion', e.target.value)}
            placeholder="Ej: 5 - 6"
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Tipo de Parqueadero
          </label>
          <select
            value={registroActual.tipoParqueadero}
            onChange={(e) => onInputChange('tipoParqueadero', e.target.value as 'carros' | 'motos')}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none bg-white"
          >
            <option value="carros"> Carros</option>
            <option value="motos"> Motos</option>
          </select>
        </div>
      </div>

      {/* Donaciones */}
      <div className="bg-indigo-50 p-6 rounded-lg border-2 border-indigo-200">
        <h3 className="font-bold text-lg mb-4 text-indigo-900">Información de Donaciones</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Valor Total de Donaciones ($)
            </label>
            <input
              type="number"
              value={registroActual.donaciones.valor || ''}
              onChange={(e) => onDonacionChange('valor', Number(e.target.value))}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Cantidad de Donantes
            </label>
            <input
              type="number"
              value={registroActual.donaciones.cantidadDonantes || ''}
              onChange={(e) => onDonacionChange('cantidadDonantes', Number(e.target.value))}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Valor Adicional - Facturas Electrónicas */}
      <SeccionFacturasElectronicas
        facturaElectronica={registroActual.facturaElectronica!}
        itemsFacturas={itemsFacturas}
        onFacturaChange={onFacturaChange}
        onItemsChange={onItemsFacturasChange}
      />

      {/* Firmas - CORREGIDO */}
      <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
        <h3 className="font-bold text-lg mb-4 text-yellow-900">Firmas de Respaldo</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Trabajador */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Trabajador</label>
            <select
              value={registroActual.firmas.trabajador?.nombre || ''}
              onChange={(e) => handleSelectFirma('trabajador', e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
            >
              <option value="">Seleccionar...</option>
              {firmas.trabajador.map(f => (
                <option key={f.nombre} value={f.nombre}>{f.nombre}</option>
              ))}
            </select>
          </div>

          {/* Supervisor */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Supervisor</label>
            <select
              value={registroActual.firmas.supervisor?.nombre || ''}
              onChange={(e) => handleSelectFirma('supervisor', e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
            >
              <option value="">Seleccionar...</option>
              {firmas.supervisor.map(f => (
                <option key={f.nombre} value={f.nombre}>{f.nombre}</option>
              ))}
            </select>
          </div>

          {/* Responsable de Conteo */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Responsable de Conteo</label>
            <select
              value={registroActual.firmas.responsable?.nombre || ''}
              onChange={(e) => handleSelectFirma('responsable', e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
            >
              <option value="">Seleccionar...</option>
              {firmas.responsable.map(f => (
                <option key={f.nombre} value={f.nombre}>{f.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};