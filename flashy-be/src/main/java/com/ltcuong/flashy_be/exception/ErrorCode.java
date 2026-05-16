package com.ltcuong.flashy_be.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_EXISTED(1001,"Username already existed", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED(1009,"Email already existed", HttpStatus.BAD_REQUEST),
    INVALID_KEY(1004, "Uncategorized error", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1002,"Username at least {min} charactes", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1003,"Password at least {min} charactes", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005,"User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006,"Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007,"You do not have permission",HttpStatus.FORBIDDEN),
    INVALID_DOB(1008,"You must be at least {min} years old",HttpStatus.BAD_REQUEST),
    FOLDER_NOT_FOUND(2001, "Folder not found", HttpStatus.NOT_FOUND),
    SET_NOT_FOUND(2002, "Flashcard set not found", HttpStatus.NOT_FOUND),
    FLASHCARD_NOT_FOUND(2003, "Flashcard not found", HttpStatus.NOT_FOUND),
    FORBIDDEN_RESOURCE(2004, "You do not have access to this resource", HttpStatus.FORBIDDEN),
    QUIZ_NOT_FOUND(2005, "Quiz not found", HttpStatus.NOT_FOUND),
    EMAIL_NOT_FOUND(3001, "No account found with this email", HttpStatus.NOT_FOUND),
    OTP_INVALID(3002, "Invalid OTP code", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED(3003, "OTP code has expired", HttpStatus.BAD_REQUEST),
    ACCOUNT_LOCKED(1010, "Your account has been locked", HttpStatus.FORBIDDEN),
    CANNOT_DELETE_SELF(1011, "You cannot delete your own admin account", HttpStatus.BAD_REQUEST),
    AI_GENERATION_FAILED(5001, "AI generation failed. Please try again.", HttpStatus.INTERNAL_SERVER_ERROR),
    ;

    private int code;
    private String message;
    private HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }




}
