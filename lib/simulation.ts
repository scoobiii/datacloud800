import { PlantStatus, FuelMode } from '../types';

export interface SelectedPlantForSimulation {
  type?: string;
  name: string;
  efficiency?: number | null;
  fuelKey: string;
}

export interface FuelMixConfig {
  h2: number;
  biodiesel: number;
}

export const CO2_FACTORS_KG_PER_KWH = {
  baseline: 0.4,
  [FuelMode.NaturalGas]: 0.2,
  [FuelMode.Ethanol]: 0.1,
  [FuelMode.Biodiesel]: 0.12,
  [FuelMode.Nuclear]: 0,
};

/**
 * Calculates the incremental efficiency gain due to trigeneration and absorption cooling.
 */
export function calculateEfficiencyGain(params: {
  plantStatus: PlantStatus;
  powerOutput: number;
  selectedPlant: SelectedPlantForSimulation;
  efficiency: number;
  ambientTemp?: number;
}): number {
  const isOnline = params.plantStatus === PlantStatus.Online;
  if (!isOnline) {
    return 0;
  }

  const isTrigenerationProject = 
    params.selectedPlant.type === 'standard' || 
    params.selectedPlant.name === 'Parque Térmico Pedreira';

  const currentEfficiency = params.selectedPlant.efficiency ?? params.efficiency;
  if (currentEfficiency <= 0) {
    return 0;
  }
  const powerInput = params.powerOutput / (currentEfficiency / 100);
  const wasteHeat = powerInput - params.powerOutput;
  
  if ((isTrigenerationProject || params.selectedPlant.fuelKey === 'fuel.NUCLEAR') && wasteHeat > 0) {
    const chillerCOP = 0.694;
    const coolingProduction = wasteHeat * chillerCOP;

    const coolingDistribution = { tiac: 40, fog: 25, dataCenter: 35 };
    const tiacCooling = coolingProduction * (coolingDistribution.tiac / 100);
    const fogCooling = coolingProduction * (coolingDistribution.fog / 100);
    const dataCenterCooling = coolingProduction * (coolingDistribution.dataCenter / 100);

    const ambientTemp = params.ambientTemp ?? 28.5;
    const ISO_TEMP_THRESHOLD = 25;
    if (ambientTemp > ISO_TEMP_THRESHOLD) {
      const tiacGain = tiacCooling / 300;
      const fogGain = fogCooling / 400;
      const dataCenterGain = dataCenterCooling / 1000;
      return tiacGain + fogGain + dataCenterGain;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
}

/**
 * Calculates the CO2 emissions factor based on the fuel mode and flex mix configurations.
 */
export function calculateCo2Factor(fuelMode: FuelMode, flexMix: FuelMixConfig): number {
  let currentCo2Factor = CO2_FACTORS_KG_PER_KWH[FuelMode.NaturalGas];
  if (fuelMode === FuelMode.FlexNGH2) {
    currentCo2Factor = CO2_FACTORS_KG_PER_KWH[FuelMode.NaturalGas] * (1 - (flexMix.h2 / 100));
  } else if (fuelMode === FuelMode.FlexEthanolBiodiesel) {
    const ethFactor = 1 - (flexMix.biodiesel / 100);
    const bioFactor = flexMix.biodiesel / 100;
    currentCo2Factor = (CO2_FACTORS_KG_PER_KWH[FuelMode.Ethanol] * ethFactor) + (CO2_FACTORS_KG_PER_KWH[FuelMode.Biodiesel] * bioFactor);
  } else if (fuelMode in CO2_FACTORS_KG_PER_KWH) {
    currentCo2Factor = CO2_FACTORS_KG_PER_KWH[fuelMode as keyof typeof CO2_FACTORS_KG_PER_KWH];
  }
  return currentCo2Factor;
}

/**
 * Calculates complete financial metrics, including energy, cloud, and carbon revenues and operational costs.
 */
export function calculateFinancials(params: {
  plantStatus: PlantStatus;
  powerOutput: number;
  fuelMode: FuelMode;
  flexMix: FuelMixConfig;
  carbonPrice: number;
  activeRackCount: number;
  revenuePerRack?: number;
  opexPerRack?: number;
}) {
  const isOnline = params.plantStatus === PlantStatus.Online;
  const BRL_USD_RATE = 5.0;
  const ENERGY_PRICE_BRL_PER_MWH = 550;
  const REVENUE_PER_RACK_PER_MONTH = params.revenuePerRack ?? 8500;
  const OPEX_PER_RACK_PER_MONTH = params.opexPerRack ?? 3000;

  const monthlyMWh = params.powerOutput * 24 * 30;
  const energyRevenue = isOnline ? monthlyMWh * ENERGY_PRICE_BRL_PER_MWH : 0;
  const cloudRevenue = isOnline ? params.activeRackCount * REVENUE_PER_RACK_PER_MONTH : 0;

  const currentCo2Factor = calculateCo2Factor(params.fuelMode, params.flexMix);

  const monthlyKWh = monthlyMWh * 1000;
  const co2ReducedKg = monthlyKWh * (CO2_FACTORS_KG_PER_KWH.baseline - currentCo2Factor);

  const isBaselineFossilFuel = (
    params.fuelMode === FuelMode.NaturalGas || 
    (params.fuelMode === FuelMode.FlexNGH2 && params.flexMix.h2 === 0)
  );
  const co2ReducedTons = isOnline && !isBaselineFossilFuel ? (co2ReducedKg > 0 ? co2ReducedKg / 1000 : 0) : 0;
  
  const carbonRevenue = co2ReducedTons * params.carbonPrice * BRL_USD_RATE;
  const totalRevenue = energyRevenue + cloudRevenue + carbonRevenue;

  const baseFuelCost = 950000;
  const baselinePower = 2250;
  const cogsFuel = isOnline ? baseFuelCost * (params.powerOutput / baselinePower) : 0;

  const grossProfit = totalRevenue - cogsFuel;

  const opexMaintenance = isOnline ? 550000 : 0;
  const opexPersonnel = isOnline ? 300000 : 0;
  const opexDataCenter = isOnline ? params.activeRackCount * OPEX_PER_RACK_PER_MONTH : 0;
  const totalOpex = opexMaintenance + opexPersonnel + opexDataCenter;

  const ebitda = grossProfit - totalOpex;
  const monthlyAmortization = 12500000;
  const ebit = ebitda - monthlyAmortization;

  const totalOperatingCosts = cogsFuel + totalOpex;

  return {
    energyRevenue,
    cloudRevenue,
    currentCo2Factor,
    co2ReducedKg,
    co2ReducedTons,
    carbonRevenue,
    totalRevenue,
    cogsFuel,
    grossProfit,
    opexMaintenance,
    opexPersonnel,
    opexDataCenter,
    totalOpex,
    ebitda,
    monthlyAmortization,
    ebit,
    totalOperatingCosts,
  };
}
