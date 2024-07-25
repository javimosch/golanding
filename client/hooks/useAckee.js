import { useState, useEffect, useCallback, useRef } from 'react'
import * as ackeeTracker from 'ackee-tracker'

const ackeeServer = "/ackee"; // Vitejs proxy route
const ackeeDomainId = process.env.ACKEE_DOMAIN_ID; 

const useAckee = (server = ackeeServer, domainId = ackeeDomainId, options = {}) => {
  const [ackeeInstance, setAckeeInstance] = useState(null);
  const stopRecordingRef = useRef(null);

  useEffect(() => {
    if (!ackeeInstance) {
      console.log("START")
      const instance = ackeeTracker.create(server, {
        detailed: true,
        ignoreLocalhost: false,
        ignoreOwnVisits: false,
        ...options
      });
      setAckeeInstance(instance);

      const stopRecording = instance.record(domainId);
      stopRecordingRef.current = stopRecording;

      return () => {
        if (stopRecordingRef.current && typeof stopRecordingRef.current?.stop === 'function') {
          stopRecordingRef.current.stop()
        }
      };
    }
  }, [server, domainId, options, ackeeInstance]);

  const trackEvent = useCallback((eventId, attributes = {}) => {
    if (ackeeInstance) {
      ackeeInstance.action(eventId, attributes);
    } else {
      console.warn('Ackee instance not initialized');
    }
  }, [ackeeInstance]);

  return { trackEvent };
};

export default useAckee;
