package co.edu.uco.apigatwayservice.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping(path = "/auth", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthorizationController {

        private final AuthorizationService authorizationService;

        public AuthorizationController(AuthorizationService authorizationService) {
                this.authorizationService = authorizationService;
        }

        @PostMapping("/authorize")
        public Mono<ResponseEntity<AuthorizationDecision>> authorize(@AuthenticationPrincipal Mono<Jwt> jwtMono) {
                return jwtMono
                                .map(authorizationService::evaluate)
                                .map(this::buildResponse)
                                .defaultIfEmpty(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                                .body(AuthorizationDecision.denied(
                                                                "No se encontró un token JWT para procesar.")));
        }

        private ResponseEntity<AuthorizationDecision> buildResponse(AuthorizationDecision decision) {
                if (decision.authorized()) {
                        return ResponseEntity.ok(decision);
                }

                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(decision);
        }
}
