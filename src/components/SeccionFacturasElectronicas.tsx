import React, { useState } from 'react';
import { Receipt, Trash2 } from 'lucide-react';
import { FacturaElectronica, ItemFactura } from '@/types';

interface SeccionFacturasElectronicasProps {
  facturaElectronica: FacturaElectronica;
  itemsFacturas: ItemFactura[];
  onFacturaChange: (field: keyof FacturaElectronica, value: number) => void;
  onItemsChange: (items: ItemFactura[]) => void;
}

export const SeccionFacturasElectronicas: React.FC<SeccionFacturasElectronicasProps> = ({
  facturaElectronica,
  itemsFacturas,
  onFacturaChange,
  onItemsChange
}) => {
  const [habilitado, setHabilitado] = useState(false);

  const calcularValorPorPersona = () => {
    if (facturaElectronica.cantidadPersonas === 0) return 0;
    return Math.round(facturaElectronica.valor / facturaElectronica.cantidadPersonas);
  };

  const handleToggle = () => {
    setHabilitado(!habilitado);
    if (!habilitado) {
      // Al habilitar, generar items automáticamente
      generarItemsAutomatico();
    } else {
      // Al deshabilitar, limpiar items
      onItemsChange([]);
    }
  };

  const generarItemsAutomatico = () => {
    const valorPorPersona = calcularValorPorPersona();
    const nuevosItems: ItemFactura[] = [];
    
    for (let i = 0; i < facturaElectronica.cantidadPersonas; i++) {
      nuevosItems.push({
        item: i + 1,
        donante: 'ANÓNIMO',
        documento: '',
        medio: 'FACTURA ELECTRÓNICA',
        valor: valorPorPersona,
        reciboN: '',
        observaciones: 'SIN OBSERVACIONES'
      });
    }
    
    onItemsChange(nuevosItems);
  };

  const handleActualizarItem = (index: number, campo: keyof ItemFactura, valor: any) => {
    const nuevosItems = [...itemsFacturas];
    if (campo === 'valor') {
      nuevosItems[index] = { ...nuevosItems[index], [campo]: Number(valor) };
    } else {
      nuevosItems[index] = { ...nuevosItems[index], [campo]: valor };
    }
    onItemsChange(nuevosItems);
  };

  const handleEliminarItem = (index: number) => {
    const nuevosItems = itemsFacturas.filter((_, i) => i !== index);
    // Reordenar items
    const reordenados = nuevosItems.map((item, idx) => ({ ...item, item: idx + 1 }));
    onItemsChange(reordenados);
  };

  const handleAgregarItem = () => {
    const nuevoItem: ItemFactura = {
      item: itemsFacturas.length + 1,
      donante: 'ANÓNIMO',
      documento: '',
      medio: 'FACTURA ELECTRÓNICA',
      valor: 0,
      reciboN: '',
      observaciones: 'SIN OBSERVACIONES'
    };
    onItemsChange([...itemsFacturas, nuevoItem]);
  };

  return (
    <div className="relative">
      {/* Switch en la esquina superior derecha */}
      <div className="absolute top-4 right-4 z-10">
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm font-semibold text-gray-700">
            {habilitado ? 'Habilitado' : 'Deshabilitado'}
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={habilitado}
              onChange={handleToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-purple-600 peer-focus:ring-2 peer-focus:ring-purple-300 transition-colors"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
          </div>
        </label>
      </div>

      {/* Contenedor principal */}
      <div className={`transition-opacity ${habilitado ? 'opacity-100' : 'opacity-50'}`}>
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Valor Adicional - Facturas Electrónicas
        </label>

        {/* Campos de entrada */}
        <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
          <h3 className="font-bold text-lg mb-4 text-purple-900">Información de Facturas Electrónicas</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Valor Total de Facturas ($)
              </label>
              <input
                type="number"
                value={facturaElectronica.valor || ''}
                onChange={(e) => onFacturaChange('valor', Number(e.target.value))}
                disabled={!habilitado}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Cantidad de Personas
              </label>
              <input
                type="number"
                value={facturaElectronica.cantidadPersonas || ''}
                onChange={(e) => onFacturaChange('cantidadPersonas', Number(e.target.value))}
                disabled={!habilitado}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {habilitado && facturaElectronica.valor > 0 && facturaElectronica.cantidadPersonas > 0 && (
            <>
              

              <button
                onClick={generarItemsAutomatico}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 font-semibold mb-4"
              >
                Generar {facturaElectronica.cantidadPersonas} Registros
              </button>
            </>
          )}

          {/* Lista de items editables */}
          {habilitado && itemsFacturas.length > 0 && (
            <div className="border-t-2 border-purple-200 pt-4 mt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-800">Registros de Facturas ({itemsFacturas.length})</h4>
                <button
                  onClick={handleAgregarItem}
                  className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                >
                  + Agregar
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {itemsFacturas.map((item, idx) => (
                  <div key={idx} className="bg-white border-2 border-purple-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-purple-600">Item #{item.item}</span>
                      <button
                        onClick={() => handleEliminarItem(idx)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Donante</label>
                        <input
                          type="text"
                          value={item.donante}
                          onChange={(e) => handleActualizarItem(idx, 'donante', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Documento</label>
                        <input
                          type="text"
                          value={item.documento}
                          onChange={(e) => handleActualizarItem(idx, 'documento', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Medio</label>
                        <input
                          type="text"
                          value={item.medio}
                          onChange={(e) => handleActualizarItem(idx, 'medio', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Valor ($)</label>
                        <input
                          type="number"
                          value={item.valor}
                          onChange={(e) => handleActualizarItem(idx, 'valor', Number(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Recibo N.</label>
                        <input
                          type="text"
                          value={item.reciboN}
                          onChange={(e) => handleActualizarItem(idx, 'reciboN', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Observaciones</label>
                        <input
                          type="text"
                          value={item.observaciones}
                          onChange={(e) => handleActualizarItem(idx, 'observaciones', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};