import { Request, Response } from 'express';
import { AlertRepository } from '../models/Alert';

export class AlertController {
  public static async getAllAlerts(req: Request, res: Response): Promise<void> {
    try {
      const activeOnly = req.query.active === 'true';
      const allAlerts = await AlertRepository.getAll(activeOnly);
      const alerts = req.user?.role === 'admin'
        ? allAlerts
        : allAlerts.filter(alert => alert.busId === req.user?.assignedBusId);
      res.json({ success: true, count: alerts.length, data: alerts });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async createAlert(req: Request, res: Response): Promise<void> {
    try {
      const { busId, busNumber, type, severity, message, location } = req.body;

      if (!busId || !type || !message) {
        res.status(400).json({ success: false, message: 'busId, type, and message are required' });
        return;
      }
      if (req.user?.role !== 'admin' && busId !== req.user?.assignedBusId) {
        res.status(403).json({ success: false, message: 'You can only report incidents for your assigned bus.' });
        return;
      }
      if (
        !['SOS', 'BREAKDOWN', 'TRAFFIC_JAM', 'ROUTE_DEVIATION', 'GEOFENCE_APPROACH', 'OVER_SPEED'].includes(type) ||
        (req.user?.role === 'student' && type !== 'SOS')
      ) {
        res.status(403).json({ success: false, message: 'This account cannot submit that incident type.' });
        return;
      }

      const alert = await AlertRepository.createAlert({
        busId,
        busNumber: busNumber || 'Bus Fleet',
        type,
        severity: severity || 'MEDIUM',
        message,
        location: location || { lat: 21.2330, lng: 79.0880 },
        status: 'ACTIVE',
        reportedBy: req.user?.role === 'driver' ? 'DRIVER' : 'STUDENT'
      });

      res.status(201).json({ success: true, data: alert });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const resolved = await AlertRepository.resolveAlert(req.params.id);
      if (!resolved) {
        res.status(404).json({ success: false, message: 'Alert not found' });
        return;
      }
      res.json({ success: true, data: resolved });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
