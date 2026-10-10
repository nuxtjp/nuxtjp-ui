import credentialReadiness from '../samples/credential-readiness.json'
import controlCoverage from '../samples/control-coverage.json'
import networkControls from '../samples/network-controls.json'
import networkObservations from '../samples/network-observations.json'
import networkTopology from '../samples/network-topology.json'

/**
 * Samples cross the same unknown-data boundary used by a real HTTP or local
 * runtime projection; the module performs validation before rendering.
 */
export const documents = {
  credentialReadiness,
  networkObservations,
  networkControls,
  controlCoverage,
  networkTopology
}
