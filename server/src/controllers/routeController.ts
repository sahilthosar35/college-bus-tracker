import { Request, Response } from 'express';
import { RouteRepository } from '../models/Route';

export class RouteController {
  public static async getAllRoutes(req: Request, res: Response): Promise<void> {
    try {
      const routes = await RouteRepository.getAll();
      res.json({ success: true, count: routes.length, data: routes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getRouteById(req: Request, res: Response): Promise<void> {
    try {
      const route = await RouteRepository.getById(req.params.id);
      if (!route) {
        res.status(404).json({ success: false, message: 'Route not found' });
        return;
      }
      res.json({ success: true, data: route });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getRouteStops(req: Request, res: Response): Promise<void> {
    try {
      const route = await RouteRepository.getById(req.params.id);
      if (!route) {
        res.status(404).json({ success: false, message: 'Route not found' });
        return;
      }
      res.json({ success: true, stops: route.stops });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
