package com.greenjuicehub.backend.controller;

import com.greenjuicehub.backend.dto.banner.response.BannerResponse;
import com.greenjuicehub.backend.exception.GlobalExceptionHandler;
import com.greenjuicehub.backend.service.auth.TokenBlacklistService;
import com.greenjuicehub.backend.service.banner.IBannerService;
import com.greenjuicehub.backend.utils.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BannerController.class)
@Import({GlobalExceptionHandler.class, ControllerMockMvcTestSecurityConfiguration.class})
@ActiveProfiles("test")
class BannerControllerMockMvcIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private IBannerService bannerService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;

    @Test
    void anonymousUserGetsActiveBannersForHomepage() throws Exception {
        when(bannerService.getActiveBanners()).thenReturn(List.of(
                BannerResponse.builder().id(1L).title("Sale hè").imageUrl("https://cdn.test/1.png")
                        .sortOrder(1).isActive(true).build(),
                BannerResponse.builder().id(2L).title("Deal cuối tuần").imageUrl("https://cdn.test/2.png")
                        .sortOrder(2).isActive(true).build()));

        mockMvc.perform(get("/api/banners"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(2)))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Sale hè"))
                .andExpect(jsonPath("$[1].title").value("Deal cuối tuần"));
    }

    @Test
    void getActiveBannersReturnsEmptyListWhenNoneActive() throws Exception {
        when(bannerService.getActiveBanners()).thenReturn(List.of());

        mockMvc.perform(get("/api/banners"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(0)));
    }
}