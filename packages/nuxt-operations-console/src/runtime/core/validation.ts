import {
  isCredentialReadinessDocument,
  isNetworkControlsDocument,
  isNetworkObservationsDocument
} from './guards'
import type {
  CredentialReadinessDocument,
  NetworkControlsDocument,
  NetworkObservationsDocument,
  OperationsDocuments,
  OperationsValidation
} from './types'
import { immutableSnapshot } from './snapshot'

export interface ValidOperationsDocuments {
  credentialReadiness: CredentialReadinessDocument
  networkObservations: NetworkObservationsDocument
  networkControls: NetworkControlsDocument
}

export type OperationsValidationResult =
  | { valid: true, checks: OperationsValidation, documents: ValidOperationsDocuments }
  | { valid: false, checks: OperationsValidation }

export function validateOperationsDocuments(
  input: OperationsDocuments
): OperationsValidationResult {
  const credentialReadiness = isCredentialReadinessDocument(input.credentialReadiness)
  const networkObservations = isNetworkObservationsDocument(input.networkObservations)
  const networkControls = isNetworkControlsDocument(input.networkControls)
  const checks: OperationsValidation = {
    credentialReadiness,
    networkObservations,
    networkControls,
    valid: credentialReadiness && networkObservations && networkControls
  }
  if (!checks.valid) return { valid: false, checks }
  return immutableSnapshot({
    valid: true,
    checks,
    documents: {
      credentialReadiness: input.credentialReadiness as CredentialReadinessDocument,
      networkObservations: input.networkObservations as NetworkObservationsDocument,
      networkControls: input.networkControls as NetworkControlsDocument
    }
  })
}
