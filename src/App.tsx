import React, { useState, useMemo } from 'react';
import { useSmartRoute } from './hooks/useSmartRoute';
import { BASE_GRAPH } from './graph/graphData';
import { validateGraph } from './graph/graphValidation';
import { Header } from './components/Header';
import { MapCanvas } from './components/MapCanvas';
import { SimulationBar } from './components/SimulationBar';
import { RouteControls } from './components/RouteControls';
import { AlgorithmControls } from './components/AlgorithmControls';
import { RoadInspector } from './components/RoadInspector';
import { RouteSummary } from './components/RouteSummary';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ComplexityPanel } from './components/ComplexityPanel';
import { ComparisonPanel } from './components/ComparisonPanel';
import { ExecutionLog } from './components/ExecutionLog';
import { RuntimeBenchmark } from './components/RuntimeBenchmark';

type SidebarTab = 'plan' | 'analysis' | 'log';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('plan');

  // Validate base graph on startup
  const validationResult = useMemo(() => validateGraph(BASE_GRAPH), []);

  const {
    sourceId,
    destinationId,
    algorithm,
    closedEdges,
    selectedEdgeId,
    selectedEdge,
    showWeights,
    currentResult,
    baselineResult,
    isRouteStale,
    comparisonNote,
    currentStep,
    isPlaying,
    speed,
    visualState,
    setSource,
    setDestination,
    swapEndpoints,
    setAlgorithm,
    setShowWeights,
    setSelectedEdgeId,
    closeRoad,
    reopenRoad,
    resetAllClosures,
    runAlgorithm,
    play,
    pause,
    nextStep,
    prevStep,
    jumpToEnd,
    resetSimulation,
    goToStep,
    setSpeed,
    resetJourney,
    resetEntireSimulation,
    loadDefaultDemo,
  } = useSmartRoute();

  const currentRouteEdgeIds = useMemo(() => {
    return new Set(currentResult?.route.steps.map((s) => s.edgeId) ?? []);
  }, [currentResult]);

  if (!validationResult.isValid) {
    return (
      <div style={{ padding: '30px', color: '#f43f5e', backgroundColor: '#090e17', minHeight: '100vh' }}>
        <h2>Critical Graph Validation Error</h2>
        <p>The base graph failed integrity checks. Correct the graph definition before running:</p>
        <ul>
          {validationResult.errors.map((err, idx) => (
            <li key={idx}>
              [{err.code}] {err.message}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header
        activeAlgorithm={algorithm}
        onLoadDemo={loadDefaultDemo}
        onResetAll={resetEntireSimulation}
      />

      <main className="main-workspace">
        {/* Left: Map & Interactive Simulation Scrubber */}
        <section className="map-panel" aria-label="Road Map and Simulation Canvas">
          <MapCanvas
            visualState={visualState}
            sourceId={sourceId}
            destinationId={destinationId}
            selectedEdgeId={selectedEdgeId}
            showWeights={showWeights}
            onSelectEdge={setSelectedEdgeId}
            onSelectAsStart={setSource}
            onSelectAsDestination={setDestination}
            onToggleWeights={setShowWeights}
          />

          <SimulationBar
            trace={currentResult?.trace ?? []}
            currentStep={currentStep}
            isPlaying={isPlaying}
            speed={speed}
            statusMessage={visualState.statusMessage}
            onPlay={play}
            onPause={pause}
            onNextStep={nextStep}
            onPrevStep={prevStep}
            onResetStep={resetSimulation}
            onJumpToEnd={jumpToEnd}
            onGoToStep={goToStep}
            onSetSpeed={setSpeed}
          />
        </section>

        {/* Right: Sidebar with Organized Tabs */}
        <aside className="sidebar-panel" aria-label="Route planning and analysis sidebar">
          <nav className="sidebar-tabs" role="tablist" aria-label="Sidebar Sections">
            <button
              className={`sidebar-tab-btn ${activeTab === 'plan' ? 'active' : ''}`}
              onClick={() => setActiveTab('plan')}
              role="tab"
              aria-selected={activeTab === 'plan'}
            >
              Route & Closures
            </button>
            <button
              className={`sidebar-tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
              onClick={() => setActiveTab('analysis')}
              role="tab"
              aria-selected={activeTab === 'analysis'}
            >
              Analysis & Comparison
            </button>
            <button
              className={`sidebar-tab-btn ${activeTab === 'log' ? 'active' : ''}`}
              onClick={() => setActiveTab('log')}
              role="tab"
              aria-selected={activeTab === 'log'}
            >
              Trace Log ({currentResult?.trace.length ?? 0})
            </button>
          </nav>

          <div className="sidebar-content">
            {activeTab === 'plan' && (
              <>
                <RouteControls
                  sourceId={sourceId}
                  destinationId={destinationId}
                  currentResult={currentResult}
                  closedEdges={closedEdges}
                  onSetSource={setSource}
                  onSetDestination={setDestination}
                  onSwapEndpoints={swapEndpoints}
                  onFindRoute={() => runAlgorithm()}
                  onResetJourney={resetJourney}
                  onCloseRoad={closeRoad}
                />

                <AlgorithmControls
                  algorithm={algorithm}
                  onSetAlgorithm={(algo) => {
                    setAlgorithm(algo);
                    if (currentResult) {
                      runAlgorithm(undefined, undefined, algo);
                    }
                  }}
                />

                <RoadInspector
                  selectedEdge={selectedEdge}
                  closedEdges={closedEdges}
                  currentRouteEdgeIds={currentRouteEdgeIds}
                  onCloseRoad={closeRoad}
                  onReopenRoad={reopenRoad}
                  onResetAllClosures={resetAllClosures}
                  onSelectEdge={setSelectedEdgeId}
                />

                <RouteSummary
                  currentResult={currentResult}
                  baselineResult={baselineResult}
                  isRouteStale={isRouteStale}
                  comparisonNote={comparisonNote}
                  onRecalculate={() => runAlgorithm()}
                />
              </>
            )}

            {activeTab === 'analysis' && (
              <>
                <RouteSummary
                  currentResult={currentResult}
                  baselineResult={baselineResult}
                  isRouteStale={isRouteStale}
                  comparisonNote={comparisonNote}
                  onRecalculate={() => runAlgorithm()}
                />

                <AnalysisDashboard
                  counters={currentResult?.counters}
                  closedEdgesCount={closedEdges.size}
                />

                <ComparisonPanel
                  sourceId={sourceId}
                  destinationId={destinationId}
                  closedEdges={closedEdges}
                />

                <ComplexityPanel algorithm={algorithm} />

                <RuntimeBenchmark
                  sourceId={sourceId}
                  destinationId={destinationId}
                  closedEdges={closedEdges}
                />
              </>
            )}

            {activeTab === 'log' && (
              <ExecutionLog
                trace={currentResult?.trace ?? []}
                currentStep={currentStep}
                onGoToStep={goToStep}
              />
            )}
          </div>
        </aside>
      </main>
    </div>
  );
};
export default App;
