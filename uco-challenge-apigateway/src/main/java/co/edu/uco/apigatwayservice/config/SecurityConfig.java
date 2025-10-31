package co.edu.uco.apigatwayservice.config;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

        private final List<String> allowedOrigins;

        public SecurityConfig(@Value("${web.cors.allowed-origins:*}") String allowedOrigins) {
                this.allowedOrigins = parseAllowedOrigins(allowedOrigins);
        }

        @Bean
        public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
                return http
                                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .authorizeExchange(exchanges -> exchanges
                                                .pathMatchers(HttpMethod.OPTIONS).permitAll()
                                                .pathMatchers("/actuator/**").permitAll()
                                                .pathMatchers("/auth/authorize").authenticated()
                                                .anyExchange().authenticated())
                                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                                .build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                if (allowedOrigins.isEmpty() || allowedOrigins.contains("*")) {
                        configuration.addAllowedOriginPattern("*");
                } else {
                        configuration.setAllowedOrigins(allowedOrigins);
                }
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
                configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
                configuration.setExposedHeaders(List.of("Authorization"));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

        private List<String> parseAllowedOrigins(String configuredOrigins) {
                if (configuredOrigins == null || configuredOrigins.isBlank()) {
                        return List.of();
                }

                Set<String> uniqueOrigins = Arrays.stream(configuredOrigins.split(","))
                                .map(String::trim)
                                .filter(origin -> !origin.isEmpty())
                                .collect(Collectors.toCollection(LinkedHashSet::new));

                return List.copyOf(uniqueOrigins);
        }
}
