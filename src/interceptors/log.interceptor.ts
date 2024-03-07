import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { Observable, tap } from 'rxjs'

export class LogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const dt = Date.now()
    const request = context.switchToHttp().getRequest()
    return next.handle().pipe(
      tap(() => {
        console.log(`Request to ${request.url} took: ${Date.now() - dt}ms`)
      }),
    )
  }
}
