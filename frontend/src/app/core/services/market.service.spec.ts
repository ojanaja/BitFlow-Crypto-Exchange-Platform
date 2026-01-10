import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MarketService } from './market.service';
import { take } from 'rxjs/operators';

describe('MarketService', () => {
    let service: MarketService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [MarketService]
        });
        service = TestBed.inject(MarketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should generate historical data for default 1H interval', () => {
        const data = service.generateHistoricalData();
        expect(data.length).toBe(720); 

        const candle = data[0];
        expect(candle.time).toBeDefined();
        expect(candle.open).toBeDefined();
        expect(candle.high).toBeDefined();
        expect(candle.low).toBeDefined();
        expect(candle.close).toBeDefined();
    });

    it('should generate data for custom interval (e.g., 1M)', () => {
        const data = service.generateHistoricalData('1M');
        expect(data.length).toBe(1440); 
    });

    it('should stream recent trades', (done) => {
        service.recentTrades$.pipe(take(1)).subscribe(trades => {
            expect(Array.isArray(trades)).toBeTrue();
            done();
        });
    });
});
