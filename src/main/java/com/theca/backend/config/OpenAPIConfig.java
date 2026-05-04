/**
 * Descripción: Configuración de OpenAPI para la documentación de la API REST de Theca.
 * 
 * @author Javier Pérez Báez
 * @version 1.0
 * @date 21 abr 2026
 * 
 */

package com.theca.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI().info(new Info().title("Theca API").version("1.0")
                        	.description("API para la gestión de colecciones digitales")
                        	.contact(new Contact().name("Javier Pérez Báez").email("javier@email.com"))
                        	.license(new License().name("Apache 2.0").url("http://springdoc.org")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new io.swagger.v3.oas.models.Components()
                			.addSecuritySchemes("bearerAuth", new SecurityScheme()
                											  .type(SecurityScheme.Type.HTTP)
                											  .scheme("bearer")
                											  .bearerFormat("JWT")));
    }
}
