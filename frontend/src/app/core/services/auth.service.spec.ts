import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    let routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                AuthService,
                { provide: Router, useValue: routerSpy }
            ]
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should login and store token', () => {
        const mockUser = { id: 1, email: 'test@test.com', token: 'fake-token' };

        service.login({ email: 'test@test.com', password: '123' }).subscribe(user => {
            expect(user).toEqual(mockUser);
            expect(localStorage.getItem('currentUser')).toContain('fake-token');
        });

        const req = httpMock.expectOne('/api/auth/login');
        expect(req.request.method).toBe('POST');
        req.flush(mockUser);
    });

    it('should logout and clear storage', () => {
        localStorage.setItem('currentUser', JSON.stringify({ token: 'old' }));

        service.logout();

        expect(localStorage.getItem('currentUser')).toBeNull();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);

        service.currentUser.subscribe(user => {
            expect(user).toBeNull();
        });
    });
});
