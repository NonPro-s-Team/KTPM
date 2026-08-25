package com.greenjuicehub.backend.service.banner.impl;

import com.greenjuicehub.backend.dto.banner.request.SaveBannerRequest;
import com.greenjuicehub.backend.dto.banner.response.BannerResponse;
import com.greenjuicehub.backend.entity.Banner;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.mapper.BannerMapper;
import com.greenjuicehub.backend.repository.BannerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BannerServiceImplTest {

    @Mock private BannerRepository bannerRepository;
    @Mock private BannerMapper bannerMapper;

    @InjectMocks private BannerServiceImpl bannerService;

    @Test
    void getActiveBannersMapsActiveBannersOrderedBySortOrder() {
        Banner banner = Banner.builder().id(1L).title("Sale hè").isActive(true).sortOrder(1).build();
        BannerResponse response = BannerResponse.builder().id(1L).title("Sale hè").build();

        when(bannerRepository.findByIsActiveTrueOrderBySortOrderAsc()).thenReturn(List.of(banner));
        when(bannerMapper.toResponse(banner)).thenReturn(response);

        assertThat(bannerService.getActiveBanners()).containsExactly(response);
    }

    @Test
    void getAllBannersMapsEveryBannerRegardlessOfStatus() {
        Banner active = Banner.builder().id(1L).isActive(true).build();
        Banner inactive = Banner.builder().id(2L).isActive(false).build();
        BannerResponse activeResponse = BannerResponse.builder().id(1L).build();
        BannerResponse inactiveResponse = BannerResponse.builder().id(2L).build();

        when(bannerRepository.findAllByOrderBySortOrderAsc()).thenReturn(List.of(active, inactive));
        when(bannerMapper.toResponse(active)).thenReturn(activeResponse);
        when(bannerMapper.toResponse(inactive)).thenReturn(inactiveResponse);

        assertThat(bannerService.getAllBanners()).containsExactly(activeResponse, inactiveResponse);
    }

    @Test
    void createBannerBuildsEntityFromRequestAndSaves() {
        SaveBannerRequest request = new SaveBannerRequest();
        request.setTitle("Sale hè");
        request.setDescription("Giảm giá lớn");
        request.setImageUrl("https://cdn.test/banner.png");
        request.setLinkUrl("https://shop.test/sale");
        request.setSortOrder(1);
        request.setIsActive(true);

        BannerResponse expected = BannerResponse.builder().id(1L).title("Sale hè").build();
        when(bannerMapper.toResponse(any(Banner.class))).thenReturn(expected);

        BannerResponse result = bannerService.createBanner(request);

        assertThat(result).isSameAs(expected);

        ArgumentCaptor<Banner> captor = ArgumentCaptor.forClass(Banner.class);
        verify(bannerRepository).save(captor.capture());
        assertThat(captor.getValue().getTitle()).isEqualTo("Sale hè");
        assertThat(captor.getValue().getImageUrl()).isEqualTo("https://cdn.test/banner.png");
        assertThat(captor.getValue().getSortOrder()).isEqualTo(1);
        assertThat(captor.getValue().getIsActive()).isTrue();
    }

    @Test
    void updateBannerOverwritesFieldsOfExistingBanner() {
        Banner existing = Banner.builder().id(1L).title("Old").sortOrder(0).isActive(false).build();
        SaveBannerRequest request = new SaveBannerRequest();
        request.setTitle("New");
        request.setDescription("New desc");
        request.setImageUrl("https://cdn.test/new.png");
        request.setLinkUrl("https://shop.test/new");
        request.setSortOrder(2);
        request.setIsActive(true);

        BannerResponse expected = BannerResponse.builder().id(1L).title("New").build();
        when(bannerRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(bannerMapper.toResponse(existing)).thenReturn(expected);

        BannerResponse result = bannerService.updateBanner(1L, request);

        assertThat(result).isSameAs(expected);
        assertThat(existing.getTitle()).isEqualTo("New");
        assertThat(existing.getSortOrder()).isEqualTo(2);
        assertThat(existing.getIsActive()).isTrue();
        verify(bannerRepository).save(existing);
    }

    @Test
    void updateBannerThrowsWhenBannerMissing() {
        when(bannerRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bannerService.updateBanner(1L, new SaveBannerRequest()))
                .isInstanceOf(AppException.class)
                .hasMessage("Banner không tồn tại");
    }

    @Test
    void deleteBannerRemovesExistingBanner() {
        when(bannerRepository.existsById(1L)).thenReturn(true);

        bannerService.deleteBanner(1L);

        verify(bannerRepository).deleteById(1L);
    }

    @Test
    void deleteBannerThrowsWhenBannerMissing() {
        when(bannerRepository.existsById(1L)).thenReturn(false);

        assertThatThrownBy(() -> bannerService.deleteBanner(1L))
                .isInstanceOf(AppException.class)
                .hasMessage("Banner không tồn tại");

        verify(bannerRepository, never()).deleteById(any());
    }

    @Test
    void toggleActiveFlipsCurrentStatus() {
        Banner banner = Banner.builder().id(1L).isActive(true).build();
        BannerResponse expected = BannerResponse.builder().id(1L).isActive(false).build();

        when(bannerRepository.findById(1L)).thenReturn(Optional.of(banner));
        when(bannerMapper.toResponse(banner)).thenReturn(expected);

        BannerResponse result = bannerService.toggleActive(1L);

        assertThat(result).isSameAs(expected);
        assertThat(banner.getIsActive()).isFalse();
        verify(bannerRepository).save(banner);
    }
}