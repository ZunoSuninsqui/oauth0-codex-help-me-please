package co.edu.uco.apigatwayservice.auth;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class AuthorizationService {

        private static final List<String> DEFAULT_ROLE_CLAIMS = List.of("roles", "permissions", "scope");

        private final List<String> allowedRoles;
        private final Optional<String> configuredRolesClaim;

        public AuthorizationService(@Value("${auth0.allowed-roles:}") String allowedRoles,
                        @Value("${auth0.roles-claim:}") String rolesClaim) {
                this.allowedRoles = parseCommaSeparated(allowedRoles);
                this.configuredRolesClaim = Optional.ofNullable(rolesClaim)
                                .map(String::trim)
                                .filter(value -> !value.isEmpty());
        }

        public AuthorizationDecision evaluate(Jwt jwt) {
                List<String> roles = extractRoles(jwt);

                if (roles.isEmpty()) {
                        return AuthorizationDecision.denied("El token no contiene roles reconocidos.");
                }

                if (!allowedRoles.isEmpty()) {
                        boolean authorized = roles.stream().anyMatch(allowedRoles::contains);
                        if (!authorized) {
                                return AuthorizationDecision.denied("Tu rol no está autorizado para esta aplicación.");
                        }
                }

                return AuthorizationDecision.authorized(roles);
        }

        private List<String> extractRoles(Jwt jwt) {
                if (configuredRolesClaim.isPresent()) {
                        List<String> roles = readClaim(jwt, configuredRolesClaim.get());
                        if (!roles.isEmpty()) {
                                return roles;
                        }
                }

                for (String candidate : candidateClaims(jwt)) {
                        List<String> roles = readClaim(jwt, candidate);
                        if (!roles.isEmpty()) {
                                return roles;
                        }
                }

                return List.of();
        }

        private List<String> candidateClaims(Jwt jwt) {
                Set<String> candidates = new LinkedHashSet<>(DEFAULT_ROLE_CLAIMS);
                candidates.addAll(jwt.getClaims().keySet().stream()
                                .filter(name -> name.toLowerCase(Locale.ROOT).contains("roles"))
                                .collect(Collectors.toSet()));
                return new ArrayList<>(candidates);
        }

        private List<String> readClaim(Jwt jwt, String claimName) {
                Object rawValue = jwt.getClaims().get(claimName);

                if (rawValue instanceof Collection<?> collection) {
                        return collection.stream()
                                        .map(Object::toString)
                                        .map(String::trim)
                                        .filter(value -> !value.isEmpty())
                                        .collect(Collectors.toCollection(ArrayList::new));
                }

                if (rawValue instanceof String stringValue) {
                        return Arrays.stream(stringValue.split("[,\\s]+"))
                                        .map(String::trim)
                                        .filter(value -> !value.isEmpty())
                                        .collect(Collectors.toCollection(ArrayList::new));
                }

                return List.of();
        }

        private List<String> parseCommaSeparated(String value) {
                if (value == null || value.isBlank()) {
                        return List.of();
                }

                return Arrays.stream(value.split(","))
                                .map(String::trim)
                                .filter(item -> !item.isEmpty())
                                .collect(Collectors.toCollection(ArrayList::new));
        }
}
