import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Leaf,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  PlusCircle,
  FolderOpen,
  Sun,
  ShieldCheck,
  PackageOpen,
  Award,
  Maximize2,
  Calendar,
  Eye,
} from 'lucide-react';
import { SavedDesign, Plant, PlacedPlant } from '../types';
import { BENCHMARK_SAVED_DESIGNS } from '../data/sampleDesignsData';
import { INITIAL_PLANTS } from '../data/plantsData';

interface DashboardViewProps {
  savedDesigns: SavedDesign[];
  onLoadDesign: (design: SavedDesign) => void;
  onCreateNewDesign: () => void;
  onImportBenchmarkDesigns?: (designs: SavedDesign[]) => void;
}

// Sophisticated botanical color palette
const BOTANICAL_PALETTE = [
  '#059669', // Emerald 600
  '#10B981', // Emerald 500
  '#34D399', // Emerald 400
  '#0D9488', // Teal 600
  '#14B8A6', // Teal 500
  '#2DD4BF', // Teal 400
  '#84CC16', // Lime 500
  '#D97706', // Amber 600
  '#B45309', // Amber 700
  '#6366F1', // Indigo 500
  '#8B5CF6', // Violet 500
  '#64748B', // Slate 500
];

const LIGHT_LEVEL_COLORS: Record<string, string> = {
  'Low Light Tolerant': '#0D9488',
  'Medium Light': '#10B981',
  'Bright Indirect': '#F59E0B',
  'High / Filtered Sun': '#EF4444',
  'Ambient / General': '#64748B',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  savedDesigns,
  onLoadDesign,
  onCreateNewDesign,
  onImportBenchmarkDesigns,
}) => {
  // Toggle whether to use user designs or include benchmark showcase projects if user has few/no designs
  const [dataSource, setDataSource] = useState<'user' | 'all'>(
    savedDesigns.length > 0 ? 'user' : 'all'
  );

  // Selected design filter: 'all' or specific design ID
  const [selectedDesignId, setSelectedDesignId] = useState<string>('all');

  // Active dataset depending on mode
  const effectiveDesigns = useMemo(() => {
    if (dataSource === 'user') {
      return savedDesigns.length > 0 ? savedDesigns : BENCHMARK_SAVED_DESIGNS;
    }
    // Combined unique designs
    const existingIds = new Set(savedDesigns.map((d) => d.id));
    const combined = [...savedDesigns];
    BENCHMARK_SAVED_DESIGNS.forEach((bench) => {
      if (!existingIds.has(bench.id)) {
        combined.push(bench);
      }
    });
    return combined;
  }, [savedDesigns, dataSource]);

  // Filtered designs for chart computations
  const currentDesigns = useMemo(() => {
    if (selectedDesignId === 'all') {
      return effectiveDesigns;
    }
    return effectiveDesigns.filter((d) => d.id === selectedDesignId);
  }, [effectiveDesigns, selectedDesignId]);

  // Map of plant metadata by id or name
  const plantMetaMap = useMemo(() => {
    const map = new Map<string, Plant>();
    INITIAL_PLANTS.forEach((p) => {
      map.set(p.id, p);
      map.set(p.name.toLowerCase(), p);
      map.set(p.botanicalName.toLowerCase(), p);
    });
    return map;
  }, []);

  // Compute aggregate metrics
  const stats = useMemo(() => {
    let totalPlantCount = 0;
    let totalHeightSum = 0;
    const plantCounts: Record<
      string,
      {
        id: string;
        name: string;
        botanicalName: string;
        count: number;
        imageUrl: string;
        category: string;
        light: string;
        heightSum: number;
        potChoices: Record<string, number>;
      }
    > = {};

    const categoryCounts: Record<string, number> = {};
    const lightCounts: Record<string, number> = {};
    const potShapeCounts: Record<string, number> = {};
    const potColorCounts: Record<string, number> = {};

    currentDesigns.forEach((design) => {
      (design.plants || []).forEach((plant) => {
        const qty = plant.quantity || 1;
        totalPlantCount += qty;
        totalHeightSum += (plant.heightCm || 100) * qty;

        const plantKey = plant.name || 'Unnamed Specimen';
        const meta =
          plantMetaMap.get(plant.plantId) ||
          plantMetaMap.get(plant.name.toLowerCase());

        const category = meta?.category || 'foliage';
        const light = meta?.lightRequirements || 'Bright Indirect';

        if (!plantCounts[plantKey]) {
          plantCounts[plantKey] = {
            id: plant.plantId || plantKey,
            name: plant.name,
            botanicalName: plant.botanicalName || meta?.botanicalName || '',
            count: 0,
            imageUrl: plant.imageUrl || meta?.imageUrl || '',
            category,
            light,
            heightSum: 0,
            potChoices: {},
          };
        }

        plantCounts[plantKey].count += qty;
        plantCounts[plantKey].heightSum += (plant.heightCm || 100) * qty;

        // Pot stats
        if (plant.pot) {
          const potShape = plant.pot.shape || 'cylindrical';
          const potColor = plant.pot.color || 'Standard';
          potShapeCounts[potShape] = (potShapeCounts[potShape] || 0) + qty;
          potColorCounts[potColor] = (potColorCounts[potColor] || 0) + qty;

          const potName = plant.pot.name || 'Standard Pot';
          plantCounts[plantKey].potChoices[potName] =
            (plantCounts[plantKey].potChoices[potName] || 0) + qty;
        }

        // Category stats
        categoryCounts[category] = (categoryCounts[category] || 0) + qty;

        // Light level stats
        lightCounts[light] = (lightCounts[light] || 0) + qty;
      });
    });

    const designsCount = currentDesigns.length;
    const avgPlantsPerDesign =
      designsCount > 0 ? (totalPlantCount / designsCount).toFixed(1) : '0';
    const avgHeightCm =
      totalPlantCount > 0 ? Math.round(totalHeightSum / totalPlantCount) : 0;

    // Convert plant counts to sorted array
    const sortedPlants = Object.values(plantCounts).sort(
      (a, b) => b.count - a.count
    );

    const mostPopularPlant = sortedPlants[0] || null;

    // Popular plant species bar chart data (Top 7)
    const topPlantSpeciesChartData = sortedPlants.slice(0, 7).map((p) => {
      // Shorten label for clean axis display
      const shortLabel =
        p.name.length > 22 ? p.name.split('(')[0].trim() : p.name;
      return {
        name: shortLabel,
        fullName: p.name,
        botanicalName: p.botanicalName,
        count: p.count,
        percentage:
          totalPlantCount > 0
            ? Math.round((p.count / totalPlantCount) * 100)
            : 0,
        imageUrl: p.imageUrl,
      };
    });

    // Plants per design comparison chart data
    const plantsPerDesignChartData = currentDesigns.map((d) => {
      const pCount = (d.plants || []).reduce(
        (sum, p) => sum + (p.quantity || 1),
        0
      );
      return {
        designTitle:
          d.title.length > 20 ? d.title.substring(0, 18) + '...' : d.title,
        fullTitle: d.title,
        roomName: d.roomName,
        plantsCount: pCount,
        id: d.id,
      };
    });

    // Plant Category Pie chart data
    const categoryChartData = Object.entries(categoryCounts).map(
      ([cat, count]) => {
        const formatted =
          cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ');
        return {
          name: formatted,
          value: count,
          percentage:
            totalPlantCount > 0
              ? Math.round((count / totalPlantCount) * 100)
              : 0,
        };
      }
    );

    // Light level requirement chart data
    const lightChartData = Object.entries(lightCounts).map(([light, count]) => ({
      name: light,
      count,
      color: LIGHT_LEVEL_COLORS[light] || '#10B981',
      percentage:
        totalPlantCount > 0 ? Math.round((count / totalPlantCount) * 100) : 0,
    }));

    // Pot shape data (Top 5)
    const potShapeChartData = Object.entries(potShapeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([shape, count]) => ({
        shape: shape.charAt(0).toUpperCase() + shape.slice(1),
        count,
      }));

    return {
      designsCount,
      totalPlantCount,
      avgPlantsPerDesign,
      avgHeightCm,
      uniqueSpeciesCount: sortedPlants.length,
      mostPopularPlant,
      sortedPlants,
      topPlantSpeciesChartData,
      plantsPerDesignChartData,
      categoryChartData,
      lightChartData,
      potShapeChartData,
    };
  }, [currentDesigns, plantMetaMap]);

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-stone-800 pb-24">
      {/* Header Banner */}
      <div className="bg-stone-900 border-b border-stone-800 text-stone-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono tracking-wider uppercase mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Biophilic Portfolio Intelligence</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-white tracking-tight">
              Design Analytics & Species Insights
            </h1>
            <p className="text-stone-400 text-sm mt-2 max-w-2xl font-light leading-relaxed">
              Real-time telemetry across your saved interior plant arrangements.
              Evaluate most popular species, average specimens per layout, light
              tolerances, and container selections.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Data Source Selector */}
            <div className="inline-flex rounded-md bg-stone-800/80 p-1 border border-stone-700/80 text-xs">
              <button
                onClick={() => setDataSource('user')}
                className={`px-3 py-1.5 rounded transition-all font-medium ${
                  dataSource === 'user'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                My Designs ({savedDesigns.length})
              </button>
              <button
                onClick={() => setDataSource('all')}
                className={`px-3 py-1.5 rounded transition-all font-medium ${
                  dataSource === 'all'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Include Benchmark Projects ({effectiveDesigns.length})
              </button>
            </div>

            <button
              onClick={onCreateNewDesign}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded flex items-center gap-2 shadow-md transition-colors shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Design</span>
            </button>
          </div>
        </div>

        {/* Project Selector Filter Strip */}
        <div className="max-w-7xl mx-auto mt-6 pt-5 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-stone-400">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono uppercase tracking-wider text-[11px]">
              Filter Scope:
            </span>
            <select
              value={selectedDesignId}
              onChange={(e) => setSelectedDesignId(e.target.value)}
              className="bg-stone-800 text-stone-200 border border-stone-700 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="all">
                All Designs ({effectiveDesigns.length} Projects Aggregated)
              </option>
              {effectiveDesigns.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({(d.plants || []).length} plants)
                </option>
              ))}
            </select>
          </div>

          {savedDesigns.length === 0 && onImportBenchmarkDesigns && (
            <div className="flex items-center gap-2 text-emerald-400 text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Viewing showcase benchmark telemetry.</span>
              <button
                onClick={() => onImportBenchmarkDesigns(BENCHMARK_SAVED_DESIGNS)}
                className="underline hover:text-emerald-300 transition-colors font-medium cursor-pointer"
              >
                Copy benchmark projects to My Designs
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Average Plants per Design */}
          <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                Design Density
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-serif text-stone-900 tracking-tight font-medium">
              {stats.avgPlantsPerDesign}
            </div>
            <p className="text-xs text-stone-600 mt-1 font-medium">
              Average Plants per Design
            </p>
            <p className="text-[11px] text-stone-600 mt-2 font-mono">
              Across {stats.designsCount}{' '}
              {stats.designsCount === 1 ? 'project' : 'projects'} (
              {stats.totalPlantCount} total plants)
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-b-xl opacity-80" />
          </div>

          {/* Card 2: Most Popular Species */}
          <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                Top Specimen
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            {stats.mostPopularPlant ? (
              <div>
                <div className="text-xl font-serif text-stone-900 tracking-tight font-medium truncate" title={stats.mostPopularPlant.name}>
                  {stats.mostPopularPlant.name}
                </div>
                <p className="text-xs text-stone-600 italic font-light truncate mt-0.5">
                  {stats.mostPopularPlant.botanicalName}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-mono font-medium rounded">
                    {stats.mostPopularPlant.count} placed (
                    {stats.totalPlantCount > 0
                      ? Math.round(
                          (stats.mostPopularPlant.count / stats.totalPlantCount) * 100
                        )
                      : 0}
                    %)
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-stone-600 mt-2">No plant data yet</div>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-b-xl opacity-80" />
          </div>

          {/* Card 3: Botanical Diversity */}
          <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                Species Diversity
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-serif text-stone-900 tracking-tight font-medium">
              {stats.uniqueSpeciesCount}
            </div>
            <p className="text-xs text-stone-600 mt-1 font-medium">
              Unique Plant Species Selected
            </p>
            <p className="text-[11px] text-stone-600 mt-2 font-mono">
              Avg Specimen Height: {stats.avgHeightCm} cm
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-b-xl opacity-80" />
          </div>

          {/* Card 4: Total Planter Fleet */}
          <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                Planter Selection
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <PackageOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-serif text-stone-900 tracking-tight font-medium">
              {stats.potShapeChartData[0]?.shape || 'Cylindrical'}
            </div>
            <p className="text-xs text-stone-600 mt-1 font-medium">
              Most Popular Pot Architecture
            </p>
            <p className="text-[11px] text-stone-600 mt-2 font-mono">
              {stats.potShapeChartData[0]?.count || 0} installations configured
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-b-xl opacity-80" />
          </div>
        </div>

        {/* Recharts Row 1: Most Popular Plant Species & Plants Per Design */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Main Chart: Most Popular Plant Species (Bar Chart) */}
          <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-stone-200/90 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 font-medium">
                  Ranked Popularity
                </div>
                <h3 className="font-serif text-lg font-medium text-stone-900">
                  Most Popular Plant Species
                </h3>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  Frequency of plant specimens placed across saved interior designs
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded font-mono font-medium">
                Top {stats.topPlantSpeciesChartData.length} Species
              </span>
            </div>

            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.topPlantSpeciesChartData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#E7E5E4"
                  />
                  <XAxis
                    type="number"
                    stroke="#78716C"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#D6D3D1' }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#44403C"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#D6D3D1' }}
                    width={140}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-stone-900 text-stone-100 p-3 rounded-lg shadow-xl border border-stone-700 text-xs">
                            <p className="font-serif font-medium text-white text-sm">
                              {data.fullName}
                            </p>
                            {data.botanicalName && (
                              <p className="text-emerald-400 italic text-[11px] mb-2 font-mono">
                                {data.botanicalName}
                              </p>
                            )}
                            <div className="flex items-center justify-between gap-4 pt-1 border-t border-stone-800 text-[11px]">
                              <span className="text-stone-400">Total Placements:</span>
                              <span className="font-mono font-bold text-emerald-400">
                                {data.count} units
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-[11px] mt-0.5">
                              <span className="text-stone-400">Portfolio Share:</span>
                              <span className="font-mono text-stone-200">
                                {data.percentage}%
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[0, 6, 6, 0]}
                    fill="#059669"
                  >
                    {stats.topPlantSpeciesChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 0
                            ? '#059669' // Emerald top rank
                            : index === 1
                            ? '#0D9488' // Teal
                            : index === 2
                            ? '#10B981' // Green
                            : '#64748B' // Slate for others
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                <span>#1 Ranked Species: </span>
                <strong className="text-stone-800">
                  {stats.mostPopularPlant?.name || 'N/A'}
                </strong>
              </span>
              <span className="font-mono">
                {stats.uniqueSpeciesCount} total varieties configured
              </span>
            </div>
          </div>

          {/* Secondary Chart: Plant Count per Design & Average Reference Line */}
          <div className="lg:col-span-5 bg-white rounded-xl p-6 border border-stone-200/90 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 font-medium">
                  Portfolio Density
                </div>
                <h3 className="font-serif text-lg font-medium text-stone-900">
                  Plants Per Design vs Average
                </h3>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  Benchmark average of{' '}
                  <span className="font-mono font-medium text-emerald-700">
                    {stats.avgPlantsPerDesign} plants
                  </span>{' '}
                  per layout
                </p>
              </div>
            </div>

            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.plantsPerDesignChartData}
                  margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="plantDensityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                  <XAxis
                    dataKey="designTitle"
                    stroke="#78716C"
                    fontSize={10}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis
                    stroke="#78716C"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#D6D3D1' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-stone-900 text-stone-100 p-3 rounded-lg shadow-xl border border-stone-700 text-xs">
                            <p className="font-serif font-medium text-white">
                              {data.fullTitle}
                            </p>
                            <p className="text-stone-400 text-[11px] mb-2 font-mono">
                              {data.roomName}
                            </p>
                            <div className="flex items-center justify-between gap-4 pt-1 border-t border-stone-800 text-[11px]">
                              <span className="text-stone-400">Specimen Count:</span>
                              <span className="font-mono font-bold text-emerald-400">
                                {data.plantsCount} plants
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-[11px] mt-0.5">
                              <span className="text-stone-400">Variance from Avg:</span>
                              <span className="font-mono text-stone-200">
                                {(data.plantsCount - parseFloat(stats.avgPlantsPerDesign)).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={parseFloat(stats.avgPlantsPerDesign) || 0}
                    stroke="#D97706"
                    strokeDasharray="4 4"
                    label={{
                      value: `Avg: ${stats.avgPlantsPerDesign}`,
                      fill: '#B45309',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="plantsCount"
                    stroke="#059669"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#plantDensityGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-0.5 bg-amber-500 inline-block border-t border-dashed border-amber-600" />
                <span>Benchmark Reference Line: {stats.avgPlantsPerDesign} plants/design</span>
              </span>
              <span className="font-mono text-stone-600">
                Max: {Math.max(...stats.plantsPerDesignChartData.map((p) => p.plantsCount), 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Recharts Row 2: Category Breakdown & Light Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-8">
          {/* Pie Chart: Plant Category Distribution */}
          <div className="lg:col-span-6 bg-white rounded-xl p-6 border border-stone-200/90 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 font-medium">
                  Botanical Typology
                </div>
                <h3 className="font-serif text-lg font-medium text-stone-900">
                  Plant Category Breakdown
                </h3>
                <p className="text-xs text-stone-500 font-light">
                  Distribution across low-light, architectural palms, foliage, and flowering plants
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.categoryChartData.map((entry, index) => (
                      <Cell
                        key={`cell-cat-${index}`}
                        fill={BOTANICAL_PALETTE[index % BOTANICAL_PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-stone-900 text-stone-100 p-2.5 rounded-lg shadow-xl border border-stone-700 text-xs">
                            <p className="font-medium text-white">{data.name}</p>
                            <p className="text-emerald-400 font-mono text-[11px]">
                              {data.value} plants ({data.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Light Requirements Breakdown */}
          <div className="lg:col-span-6 bg-white rounded-xl p-6 border border-stone-200/90 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 font-medium">
                  Microclimate Suitability
                </div>
                <h3 className="font-serif text-lg font-medium text-stone-900">
                  Light Requirements Distribution
                </h3>
                <p className="text-xs text-stone-500 font-light">
                  Analysis of ambient interior sunlight suitability for longevity
                </p>
              </div>
              <Sun className="w-5 h-5 text-amber-500" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.lightChartData}
                  margin={{ top: 20, right: 20, left: -10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                  <XAxis
                    dataKey="name"
                    stroke="#78716C"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#78716C"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#D6D3D1' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-stone-900 text-stone-100 p-2.5 rounded-lg shadow-xl border border-stone-700 text-xs">
                            <p className="font-medium text-white">{data.name}</p>
                            <p className="text-emerald-400 font-mono text-[11px]">
                              {data.count} plants ({data.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {stats.lightChartData.map((entry, index) => (
                      <Cell key={`cell-light-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Species Roster & Performance Table */}
        <div className="bg-white rounded-xl border border-stone-200/90 shadow-sm overflow-hidden mb-10">
          <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 font-medium">
                Portfolio Inventory
              </div>
              <h3 className="font-serif text-xl font-medium text-stone-900">
                Detailed Plant Species Popularity Table
              </h3>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Complete breakdown of botanical varieties, installation counts, and container preferences
              </p>
            </div>

            <div className="text-xs text-stone-500 font-mono">
              Showing {stats.sortedPlants.length} active species
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200/80 text-stone-600 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Rank</th>
                  <th className="py-3 px-4">Plant Species</th>
                  <th className="py-3 px-4">Botanical Name</th>
                  <th className="py-3 px-4 text-center">Category</th>
                  <th className="py-3 px-4 text-right">Count</th>
                  <th className="py-3 px-4 text-right">Portfolio Share</th>
                  <th className="py-3 px-4 text-right">Avg Height</th>
                  <th className="py-3 px-4">Top Chosen Planter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stats.sortedPlants.map((plant, index) => {
                  const share =
                    stats.totalPlantCount > 0
                      ? ((plant.count / stats.totalPlantCount) * 100).toFixed(1)
                      : '0';
                  const avgHeight =
                    plant.count > 0 ? Math.round(plant.heightSum / plant.count) : 0;
                  const topPotName =
                    Object.entries(plant.potChoices).sort(
                      (a, b) => b[1] - a[1]
                    )[0]?.[0] || 'Standard Planter';

                  return (
                    <tr
                      key={plant.id || index}
                      className="hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-medium ${
                            index === 0
                              ? 'bg-amber-100 text-amber-900 font-bold'
                              : index === 1
                              ? 'bg-stone-200 text-stone-800'
                              : index === 2
                              ? 'bg-orange-100 text-orange-900'
                              : 'text-stone-500'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {plant.imageUrl ? (
                            <img
                              src={plant.imageUrl}
                              alt={plant.name}
                              className="w-9 h-9 rounded-md object-contain bg-stone-100 border border-stone-200 p-0.5 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400">
                              <Leaf className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-stone-900">
                              {plant.name}
                            </div>
                            <div className="text-[10px] text-stone-500 flex items-center gap-1 font-mono">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>{plant.light}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 italic text-stone-600 font-light">
                        {plant.botanicalName || '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-700 text-[10px] font-mono rounded capitalize">
                          {plant.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800 text-sm">
                        {plant.count}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-stone-700">
                        {share}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-stone-600">
                        {avgHeight} cm
                      </td>
                      <td className="py-3 px-4 text-stone-600 text-xs">
                        <div className="truncate max-w-[200px]" title={topPotName}>
                          {topPotName}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Project Jump Carousel */}
        <div className="bg-white rounded-xl p-6 border border-stone-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 font-medium">
                Active Designs
              </div>
              <h3 className="font-serif text-lg font-medium text-stone-900">
                Inspect or Reopen Saved Designs
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-mono">
              {currentDesigns.length} Project Cards
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentDesigns.map((design) => {
              const plantCount = (design.plants || []).reduce(
                (sum, p) => sum + (p.quantity || 1),
                0
              );
              return (
                <div
                  key={design.id}
                  className="border border-stone-200 rounded-lg p-3.5 hover:border-emerald-600/50 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={design.thumbnail || design.roomImage}
                      alt={design.title}
                      className="w-16 h-14 rounded object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-serif text-sm font-medium text-stone-900 truncate">
                        {design.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {design.roomName}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-emerald-700">
                        <span>{plantCount} plants placed</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(design.updatedAt || design.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => onLoadDesign(design)}
                      className="text-xs text-emerald-700 hover:text-emerald-600 font-medium flex items-center gap-1 cursor-pointer group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Open in Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
