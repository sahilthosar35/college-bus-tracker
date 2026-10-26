import { Request, Response } from 'express';
import { BusRepository } from '../models/Bus';
import { RouteRepository } from '../models/Route';
import { ETAService } from '../services/etaService';

export class BusController {
  public static async getAllBuses(req: Request, res: Response): Promise<void> {
    try {
      const allBuses = await BusRepository.getAll();
      const buses = req.user?.role === 'admin'
        ? allBuses
        : allBuses.filter(bus => bus.id === req.user?.assignedBusId);
      res.json({ success: true, count: buses.length, data: buses });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getBusById(req: Request, res: Response): Promise<void> {
    try {
      const bus = await BusRepository.getById(req.params.id);
      if (!bus) {
        res.status(404).json({ success: false, message: 'Bus not found' });
        return;
      }

      // Also attach route details if available
      const route = await RouteRepository.getById(bus.routeId);
      res.json({ success: true, data: { ...bus, route } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status, isSOS } = req.body;
      const updated = await BusRepository.updateStatus(req.params.id, status, isSOS);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Bus not found' });
        return;
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getBusETAs(req: Request, res: Response): Promise<void> {
    try {
      const bus = await BusRepository.getById(req.params.id);
      if (!bus) {
        res.status(404).json({ success: false, message: 'Bus not found' });
        return;
      }

      const route = await RouteRepository.getById(bus.routeId);
      if (!route) {
        res.status(404).json({ success: false, message: 'Assigned route not found' });
        return;
      }

      const etas = route.stops.map(stop =>
        ETAService.calculateDynamicETA(
          bus.currentLocation.lat,
          bus.currentLocation.lng,
          bus.currentLocation.speed,
          stop,
          route.stops,
          bus.currentStopIndex,
          bus.status === 'DELAYED',
          bus.status === 'PAUSED'
        )
      );

      res.json({ success: true, busId: bus.id, etas });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
