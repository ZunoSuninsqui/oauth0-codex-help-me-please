package co.edu.uco.apigatwayservice.auth;

import java.util.List;

public record AuthorizationDecision(boolean authorized, List<String> roles, String message) {

        public AuthorizationDecision(boolean authorized, List<String> roles, String message) {
                this.authorized = authorized;
                this.roles = roles == null ? List.of() : List.copyOf(roles);
                this.message = message;
        }

        public static AuthorizationDecision authorized(List<String> roles) {
                return new AuthorizationDecision(true, roles, null);
        }

        public static AuthorizationDecision denied(String message) {
                return new AuthorizationDecision(false, List.of(), message);
        }
}
