import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global HTTP Exception Filter (NestJS Way)
 * 
 * Catches all exceptions and transforms them into user-friendly messages.
 * Works with HTTP, WebSockets, GraphQL, and Microservices.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = this.getHttpStatus(exception);
        const errorResponse = this.buildErrorResponse(exception, request, status);

        // Log the error for debugging
        this.logError(exception, request, status);

        // Send user-friendly response
        response.status(status).json(errorResponse);
    }

    /**
     * Extract HTTP status code from exception
     */
    private getHttpStatus(exception: unknown): number {
        if (exception instanceof HttpException) {
            return exception.getStatus();
        }

        // Handle MongoDB errors
        const error = exception as any;
        if (error.name === 'MongoError' || error.name === 'MongoServerError') {
            if (error.code === 11000) return HttpStatus.CONFLICT; // Duplicate key
            return HttpStatus.BAD_REQUEST;
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return HttpStatus.BAD_REQUEST;
        }

        // Default to 500
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    /**
     * Build user-friendly error response
     */
    private buildErrorResponse(exception: unknown, request: Request, status: number) {
        const timestamp = new Date().toISOString();
        const path = request.url;
        const method = request.method;
        const requestId = request.headers['x-request-id'];

        // Extract error information
        const { message, errorName, details } = this.extractErrorInfo(exception, status);

        const errorResponse: any = {
            success: false,
            error: errorName,
            message: message,
            statusCode: status,
            timestamp,
            path,
            method,
        };

        // Add request ID if available (helps with debugging)
        if (requestId) {
            errorResponse.requestId = requestId;
        }

        // Add validation details if present
        if (details) {
            errorResponse.details = details;
        }

        // In development, add stack trace
        if (process.env.NODE_ENV !== 'production' && exception instanceof Error) {
            errorResponse.stack = exception.stack;
        }

        return errorResponse;
    }

    /**
     * Extract and format error information
     */
    private extractErrorInfo(exception: unknown, status: number): {
        message: string;
        errorName: string;
        details?: any;
    } {
        // Handle NestJS HTTP exceptions
        if (exception instanceof HttpException) {
            const response = exception.getResponse();

            if (typeof response === 'string') {
                return {
                    message: this.getUserFriendlyMessage(response, status),
                    errorName: this.getErrorName(status),
                };
            }

            if (typeof response === 'object' && response !== null) {
                const exceptionResponse = response as any;

                // Handle validation errors from class-validator
                if (Array.isArray(exceptionResponse.message)) {
                    return {
                        message: 'Validation failed. Please check your input.',
                        errorName: exceptionResponse.error || 'Validation Error',
                        details: this.formatValidationErrors(exceptionResponse.message),
                    };
                }

                return {
                    message: this.getUserFriendlyMessage(exceptionResponse.message || exceptionResponse.error, status),
                    errorName: exceptionResponse.error || this.getErrorName(status),
                    details: exceptionResponse.details,
                };
            }
        }

        const error = exception as any;

        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || 'field';
            return {
                message: `A record with this ${field} already exists.`,
                errorName: 'Duplicate Entry',
                details: { field, value: error.keyValue?.[field] },
            };
        }

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError' && error.errors) {
            const validationErrors = Object.values(error.errors).map((err: any) => ({
                field: err.path,
                message: err.message,
            }));

            return {
                message: 'Validation failed. Please check your input.',
                errorName: 'Validation Error',
                details: validationErrors,
            };
        }

        // Handle standard JavaScript errors
        if (exception instanceof Error) {
            return {
                message: this.getUserFriendlyMessage(exception.message, status),
                errorName: exception.name || this.getErrorName(status),
            };
        }

        // Unknown error
        return {
            message: 'An unexpected error occurred. Please try again later.',
            errorName: 'Internal Server Error',
        };
    }

    /**
     * Convert technical messages to user-friendly ones
     */
    private getUserFriendlyMessage(technicalMessage: string, status: number): string {
        // Common error message mappings
        const messageMap: Record<string, string> = {
            // Authentication & Authorization
            'No authentication token found': 'Please log in to continue.',
            'Invalid credentials': 'The email or password you entered is incorrect.',
            'Unauthorized': 'You are not authorized to perform this action.',
            'Forbidden': 'You do not have permission to access this resource.',
            'Token expired': 'Your session has expired. Please log in again.',
            'jwt expired': 'Your session has expired. Please log in again.',
            'jwt malformed': 'Invalid authentication token. Please log in again.',

            // CSRF
            'CSRF token required': 'Security token is missing. Please refresh the page and try again.',
            'Invalid CSRF token': 'Security token is invalid. Please refresh the page and try again.',

            // Validation
            'Bad Request': 'The request contains invalid data. Please check your input.',

            // Not Found
            'Not Found': 'The requested resource was not found.',
            'User not found': 'User not found. Please check the information and try again.',
            'Resource not found': 'The requested resource was not found.',

            // Server Errors
            'Internal Server Error': 'Something went wrong on our end. Please try again later.',
            'Service Unavailable': 'The service is temporarily unavailable. Please try again later.',

            // Database
            'Cast to ObjectId failed': 'Invalid ID format provided.',
        };

        // Check for exact match
        if (messageMap[technicalMessage]) {
            return messageMap[technicalMessage];
        }

        // Check for partial match
        for (const [key, value] of Object.entries(messageMap)) {
            if (technicalMessage.toLowerCase().includes(key.toLowerCase())) {
                return value;
            }
        }

        // Status code fallbacks
        switch (status) {
        case HttpStatus.BAD_REQUEST:
            return 'Invalid request. Please check your input and try again.';
        case HttpStatus.UNAUTHORIZED:
            return 'Please log in to continue.';
        case HttpStatus.FORBIDDEN:
            return 'You do not have permission to perform this action.';
        case HttpStatus.NOT_FOUND:
            return 'The requested resource was not found.';
        case HttpStatus.CONFLICT:
            return 'This action conflicts with existing data.';
        case HttpStatus.UNPROCESSABLE_ENTITY:
            return 'Unable to process the request. Please check your input.';
        case HttpStatus.TOO_MANY_REQUESTS:
            return 'Too many requests. Please slow down and try again later.';
        case HttpStatus.INTERNAL_SERVER_ERROR:
            return 'Something went wrong. Please try again later.';
        case HttpStatus.SERVICE_UNAVAILABLE:
            return 'The service is temporarily unavailable. Please try again later.';
        case HttpStatus.GATEWAY_TIMEOUT:
            return 'The request took too long. Please try again.';
        default:
            // If the technical message looks user-friendly enough, use it
            if (technicalMessage && technicalMessage.length < 100 && !technicalMessage.includes('Error:')) {
                return technicalMessage;
            }
            return 'An error occurred. Please try again.';
        }
    }

    /**
     * Get error name from HTTP status code
     */
    private getErrorName(status: number): string {
        switch (status) {
        case HttpStatus.BAD_REQUEST:
            return 'Bad Request';
        case HttpStatus.UNAUTHORIZED:
            return 'Unauthorized';
        case HttpStatus.FORBIDDEN:
            return 'Forbidden';
        case HttpStatus.NOT_FOUND:
            return 'Not Found';
        case HttpStatus.CONFLICT:
            return 'Conflict';
        case HttpStatus.UNPROCESSABLE_ENTITY:
            return 'Unprocessable Entity';
        case HttpStatus.TOO_MANY_REQUESTS:
            return 'Too Many Requests';
        case HttpStatus.INTERNAL_SERVER_ERROR:
            return 'Internal Server Error';
        case HttpStatus.SERVICE_UNAVAILABLE:
            return 'Service Unavailable';
        case HttpStatus.GATEWAY_TIMEOUT:
            return 'Gateway Timeout';
        default:
            return 'Error';
        }
    }

    /**
     * Format validation errors into readable format
     */
    private formatValidationErrors(errors: any[]): any[] {
        return errors.map((error) => {
            if (typeof error === 'string') {
                return { message: error };
            }

            if (typeof error === 'object' && error.constraints) {
                return {
                    field: error.property,
                    errors: Object.values(error.constraints),
                };
            }

            return error;
        });
    }

    /**
     * Log error details for developers
     */
    private logError(exception: unknown, request: Request, status: number) {
        const requestId = request.headers['x-request-id'];
        const method = request.method;
        const url = request.url;
        const userId = (request as any).user?.userId || 'anonymous';
        const userAgent = request.headers['user-agent'];

        const context = {
            requestId,
            method,
            url,
            userId,
            status,
            userAgent,
        };

        const errorMessage = exception instanceof Error ? exception.message : 'Unknown error';

        if (status >= 500) {
            // Server errors - log with full stack trace
            this.logger.error(
                `[${status}] ${method} ${url} - ${errorMessage}`,
                exception instanceof Error ? exception.stack : '',
                JSON.stringify(context),
            );
        } else if (status >= 400) {
            // Client errors - log as warning (less verbose)
            this.logger.warn(
                `[${status}] ${method} ${url} - ${errorMessage}`,
                JSON.stringify(context),
            );
        }
    }
}

