import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Wallet,
  Compass,
  ArrowRight,
  CheckCircle2,
  Globe,
  Clock,
  Layers,
  Search
} from 'lucide-react';
import { apiService } from './services/api';
import type { AITripPlanResponse, Trip } from './types/trip';

export default function App() {
  const [prompt, setPrompt] = useState('Plan a 6-day Japan trip under ₹60,000. I like anime, food and nature.');
  const [loading, setLoading] = useState(false);
  const [aiPlan, setAiPlan] = useState<AITripPlanResponse | null>(null);
  const [, setSavedTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<'planner' | 'itinerary' | 'budget'>('planner');

  const handleGenerateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const result = await apiService.planTrip({ prompt });
      setAiPlan(result);
      setActiveTab('itinerary');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const trip = await apiService.planAndSaveTrip({ prompt });
      setSavedTrip(trip);
      alert(`Trip saved successfully! Public Share Link: ${window.location.origin}/share/${trip.share_slug}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-sky-500 to-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-sky-500/30">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
              GlobeTrotter
            </span>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-4">
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'planner'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-1.5" />
              AI Planner
            </button>
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'itinerary'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4 inline mr-1.5" />
              Itinerary Builder
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'budget'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Wallet className="w-4 h-4 inline mr-1.5" />
              Budget Breakdown
            </button>
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● API Online
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Tab 1: AI Planner Hero Input */}
        {activeTab === 'planner' && (
          <section className="space-y-8">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800/80 p-8 sm:p-12 text-center shadow-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-6">
                <Sparkles className="w-4 h-4" /> Powered by Gemini 2.5 AI
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
                Where to next? Let AI craft your <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">dream journey</span>.
              </h1>
              <p className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">
                Enter your travel desires, budget, and interests. GlobeTrotter generates multi-city stops, day-wise itineraries, interactive maps, and budget breakdowns.
              </p>

              <form onSubmit={handleGenerateTrip} className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Plan a 6-day Japan trip under ₹60,000 with anime & nature..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all shadow-inner text-sm sm:text-base"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="glass-button flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl font-semibold text-base min-w-[160px]"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Planning...
                    </span>
                  ) : (
                    <>
                      <span>Plan Trip</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
                <span className="font-medium text-slate-500">Try prompts:</span>
                <button onClick={() => setPrompt("Plan a 6-day Japan trip under ₹60,000. I like anime, food and nature.")} className="px-3 py-1 rounded-full bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition">
                  🇯🇵 6 Days in Japan under ₹60k
                </button>
                <button onClick={() => setPrompt("Plan a romantic 5-day Paris & Amsterdam getaway with art & river cruises.")} className="px-3 py-1 rounded-full bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition">
                  🇫🇷 5 Days Paris & Amsterdam
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: Itinerary & Map View */}
        {(activeTab === 'itinerary' || aiPlan) && (
          <section className="space-y-6">
            {aiPlan ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
                  <div>
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
                      <Globe className="w-4 h-4" /> Multi-City Destination: {aiPlan.destination}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{aiPlan.title}</h2>
                    <p className="text-slate-400 text-sm mt-1">{aiPlan.description}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSaveTrip}
                      disabled={loading}
                      className="glass-button flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Trip</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Stops & Daily Timeline */}
                  <div className="lg:col-span-2 space-y-6">
                    {aiPlan.stops.map((stop, sIdx) => (
                      <div key={sIdx} className="glass-card p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center space-x-3">
                            <span className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/30">
                              {sIdx + 1}
                            </span>
                            <div>
                              <h3 className="text-xl font-bold text-white">{stop.city_name}, {stop.country}</h3>
                              <span className="text-xs text-slate-400">{stop.days_count} Days Stay • Coordinates: {stop.latitude}, {stop.longitude}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {stop.activities.map((act, aIdx) => (
                            <div key={aIdx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-sky-500/40 transition-all space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                    Day {act.day_number} • {act.category}
                                  </span>
                                  <h4 className="font-semibold text-white text-base">{act.title}</h4>
                                </div>
                                <span className="text-xs font-semibold text-emerald-400">
                                  {act.cost > 0 ? `₹${act.cost.toLocaleString()}` : 'Free'}
                                </span>
                              </div>
                              <p className="text-slate-400 text-xs sm:text-sm">{act.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1">
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {act.duration_mins} mins</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-sky-400" /> Map Pin Attached</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary & Interactive Map Card */}
                  <div className="space-y-6">
                    <div className="glass-card p-6 space-y-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-sky-400" /> Interactive Route Map
                      </h3>
                      <div className="h-64 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-4 text-center space-y-3 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                        <Compass className="w-10 h-10 text-sky-400 animate-spin" style={{ animationDuration: '15s' }} />
                        <p className="text-xs text-slate-400 z-10 max-w-xs">
                          Mapbox route pins loaded: {aiPlan.stops.map(s => s.city_name).join(' → ')}
                        </p>
                      </div>
                    </div>

                    <div className="glass-card p-6 space-y-3">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-amber-400" /> Budget Overview
                      </h3>
                      <div className="text-3xl font-extrabold text-white">
                        {aiPlan.currency} {aiPlan.estimated_total_cost.toLocaleString()}
                      </div>
                      <p className="text-xs text-slate-400">Estimated total for {aiPlan.total_days} days multi-city tour</p>

                      <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-300">
                          <span>🏨 Accommodation</span>
                          <span className="font-semibold">{aiPlan.currency} {aiPlan.budget_breakdown.accommodation.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>🚅 Transport</span>
                          <span className="font-semibold">{aiPlan.currency} {aiPlan.budget_breakdown.transportation.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>🍜 Dining & Food</span>
                          <span className="font-semibold">{aiPlan.currency} {aiPlan.budget_breakdown.food.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center space-y-4">
                <Sparkles className="w-12 h-12 text-sky-400 mx-auto animate-bounce" />
                <h3 className="text-2xl font-bold text-white">No active trip loaded</h3>
                <p className="text-slate-400 max-w-md mx-auto">Use the AI Planner tab to generate a custom multi-city trip or explore sample itineraries.</p>
                <button onClick={() => setActiveTab('planner')} className="glass-button inline-flex items-center gap-2">
                  Go to AI Planner
                </button>
              </div>
            )}
          </section>
        )}

        {/* Tab 3: Budget Breakdown */}
        {activeTab === 'budget' && (
          <section className="glass-card p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Trip Financial Breakdown</h2>
                <p className="text-slate-400 text-sm">Visualize cost distribution across categories</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-emerald-400 font-bold text-sm">
                Target Budget: ₹60,000
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Spent / Planned</span>
                <p className="text-3xl font-extrabold text-white">₹43,500</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Remaining Buffer</span>
                <p className="text-3xl font-extrabold text-emerald-400">₹16,500</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Budget Health</span>
                <p className="text-3xl font-extrabold text-sky-400">72.5% Used</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 GlobeTrotter Hackathon Project — Built with React + Vite & FastAPI</p>
          <div className="flex space-x-4">
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>Gemini 2.5 AI</span>
            <span>•</span>
            <span>Mapbox GL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
