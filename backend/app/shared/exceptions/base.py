from typing import Any, Optional


class AppException(Exception):
    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_SERVER_ERROR",
        status_code: int = 500,
        details: Optional[Any] = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found", details: Optional[Any] = None):
        super().__init__(message=message, code="NOT_FOUND", status_code=404, details=details)


class BadRequestException(AppException):
    def __init__(self, message: str = "Invalid request", details: Optional[Any] = None):
        super().__init__(message=message, code="BAD_REQUEST", status_code=400, details=details)


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Authentication required", details: Optional[Any] = None):
        super().__init__(message=message, code="UNAUTHORIZED", status_code=401, details=details)


class ForbiddenException(AppException):
    def __init__(self, message: str = "Permission denied", details: Optional[Any] = None):
        super().__init__(message=message, code="FORBIDDEN", status_code=403, details=details)


class ConflictException(AppException):
    def __init__(self, message: str = "Conflict occurred", details: Optional[Any] = None):
        super().__init__(message=message, code="CONFLICT", status_code=409, details=details)


class DatabaseConnectionException(AppException):
    def __init__(self, message: str = "Database connection error", details: Optional[Any] = None):
        super().__init__(message=message, code="DATABASE_UNAVAILABLE", status_code=503, details=details)
