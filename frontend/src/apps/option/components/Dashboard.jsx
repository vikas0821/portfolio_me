import MarketSnapshot from "./MarketSnapshot.jsx";
import ProbabilityMeter from "./ProbabilityMeter.jsx";
import AlignmentMeter from "./AlignmentMeter.jsx";
import OIChart from "./OIChart.jsx";
import GEXChart from "./GEXChart.jsx";
import KeyLevels from "./KeyLevels.jsx";
import ExpectedRange from "./ExpectedRange.jsx";
import ParameterTable from "./ParameterTable.jsx";
import OIPatternTable from "./OIPatternTable.jsx";
import IVSkewChart from "./IVSkewChart.jsx";
import StrategyCard from "./StrategyCard.jsx";
import SummaryPanel from "./SummaryPanel.jsx";
import TrackRecord from "./TrackRecord.jsx";
import ComparisonPanel from "./ComparisonPanel.jsx";

// Renders one full analysis result (used for single + each comparison snapshot).
// `showTrackRecord` is suppressed for the collapsed comparison snapshots.
function SingleDashboard({ data, showTrackRecord = false }) {
  return (
    <div className="flex flex-col gap-5">
      <MarketSnapshot market={data.market} pcr={data.pcr} gamma={data.gamma} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ProbabilityMeter probability={data.probability} />
        <AlignmentMeter alignment={data.alignment} />
      </div>

      <GEXChart gamma={data.gamma} spot={data.market.spot} />

      <OIChart data={data.oi_chart_data} atm={data.market.atm} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <KeyLevels
          resistance={data.resistance}
          support={data.support}
          battlefield={data.battlefield}
          zones={data.sr_zones}
        />
        <ExpectedRange
          range={data.expected_range}
          spot={data.market.spot}
          maxPain={data.market.max_pain}
        />
      </div>

      <ParameterTable probability={data.probability} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <OIPatternTable patterns={data.atm_patterns} atm={data.market.atm} />
        <IVSkewChart
          data={data.oi_chart_data}
          iv={data.iv}
          atm={data.market.atm}
        />
      </div>

      <StrategyCard strategy={data.strategy} />

      {showTrackRecord && <TrackRecord refreshKey={data.timestamp} />}

      <SummaryPanel summary={data.summary} probability={data.probability} />
    </div>
  );
}

export default function Dashboard({ result }) {
  if (result.kind === "compare") {
    return (
      <div className="flex flex-col gap-5">
        <ComparisonPanel comparison={result.data} />
      </div>
    );
  }
  return <SingleDashboard data={result.data} showTrackRecord />;
}

export { SingleDashboard };
