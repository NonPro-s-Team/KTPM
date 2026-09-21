package com.greenjuicehub.backend.service.banner.impl;

import com.greenjuicehub.backend.dto.banner.request.SaveBannerRequest;
import com.greenjuicehub.backend.dto.banner.response.BannerResponse;
import com.greenjuicehub.backend.entity.Banner;
import com.greenjuicehub.backend.mapper.BannerMapper;
import com.greenjuicehub.backend.repository.BannerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class BannerServiceImplTest {

    @Mock
    private BannerRepository bannerRepository;

    @Mock
    private BannerMapper bannerMapper;

    @InjectMocks
    private BannerServiceImpl bannerService;

    private SaveBannerRequest request;
    private Banner expectedBannerToSave;
    private BannerResponse mappedResponse;

    @BeforeEach
    void setUp() {
        request = new SaveBannerRequest();
        request.setTitle("Sale he");
        request.setDescription("Uu dai mua he");
        request.setImageUrl("https://cdn.test/banner1.png");
        request.setLinkUrl("https://shop.test/sale-he");
        request.setSortOrder(1);
        request.setIsActive(true);

        expectedBannerToSave = Banner.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .linkUrl(request.getLinkUrl())
                .sortOrder(request.getSortOrder())
                .isActive(request.getIsActive())
                .build();

        mappedResponse = BannerResponse.builder()
                .id(1L)
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .linkUrl(request.getLinkUrl())
                .sortOrder(request.getSortOrder())
                .isActive(request.getIsActive())
                .build();
    }

    @Test
    @DisplayName("createBanner: build đúng entity Banner từ SaveBannerRequest và gọi repository.save() đúng 1 lần")
    void createBanner_shouldBuildEntityAndCallRepositorySave() {
        when(bannerMapper.toResponse(any(Banner.class))).thenReturn(mappedResponse);

        bannerService.createBanner(request);

        ArgumentCaptor<Banner> bannerCaptor = ArgumentCaptor.forClass(Banner.class);
        verify(bannerRepository, times(1)).save(bannerCaptor.capture());

        Banner savedBanner = bannerCaptor.getValue();
        assertThat(savedBanner.getTitle()).isEqualTo(request.getTitle());
        assertThat(savedBanner.getDescription()).isEqualTo(request.getDescription());
        assertThat(savedBanner.getImageUrl()).isEqualTo(request.getImageUrl());
        assertThat(savedBanner.getLinkUrl()).isEqualTo(request.getLinkUrl());
        assertThat(savedBanner.getSortOrder()).isEqualTo(request.getSortOrder());
        assertThat(savedBanner.getIsActive()).isEqualTo(request.getIsActive());
    }

    @Test
    @DisplayName("createBanner: trả về đúng BannerResponse do bannerMapper.toResponse() sinh ra")
    void createBanner_shouldReturnMapperResponse() {
        when(bannerMapper.toResponse(any(Banner.class))).thenReturn(mappedResponse);

        BannerResponse result = bannerService.createBanner(request);

        assertThat(result).isEqualTo(mappedResponse);
        verify(bannerMapper, times(1)).toResponse(any(Banner.class));
    }

    @Test
    @DisplayName("createBanner: gọi mapper.toResponse() với đúng entity vừa được save (cùng 1 instance)")
    void createBanner_shouldMapTheSameEntityThatWasSaved() {
        when(bannerMapper.toResponse(any(Banner.class))).thenReturn(mappedResponse);

        bannerService.createBanner(request);

        ArgumentCaptor<Banner> savedCaptor = ArgumentCaptor.forClass(Banner.class);
        ArgumentCaptor<Banner> mappedCaptor = ArgumentCaptor.forClass(Banner.class);

        verify(bannerRepository).save(savedCaptor.capture());
        verify(bannerMapper).toResponse(mappedCaptor.capture());

        // Đảm bảo Service không build 2 entity khác nhau cho save() và toResponse()
        assertThat(mappedCaptor.getValue()).isSameAs(savedCaptor.getValue());
    }

    @Test
    @DisplayName("createBanner: description/linkUrl null (optional) vẫn được map nguyên trạng vào entity, không tự set default")
    void createBanner_withNullOptionalFields_shouldPassThroughAsNull() {
        request.setDescription(null);
        request.setLinkUrl(null);

        when(bannerMapper.toResponse(any(Banner.class))).thenReturn(mappedResponse);

        bannerService.createBanner(request);

        ArgumentCaptor<Banner> bannerCaptor = ArgumentCaptor.forClass(Banner.class);
        verify(bannerRepository).save(bannerCaptor.capture());

        Banner savedBanner = bannerCaptor.getValue();
        assertThat(savedBanner.getDescription()).isNull();
        assertThat(savedBanner.getLinkUrl()).isNull();
    }

    @Test
    @DisplayName("createBanner: không gọi thêm bất kỳ method nào khác ngoài save() trên repository")
    void createBanner_shouldNotCallOtherRepositoryMethods() {
        when(bannerMapper.toResponse(any(Banner.class))).thenReturn(mappedResponse);

        bannerService.createBanner(request);

        verify(bannerRepository, times(1)).save(any(Banner.class));
        verifyNoMoreInteractions(bannerRepository);
    }
}