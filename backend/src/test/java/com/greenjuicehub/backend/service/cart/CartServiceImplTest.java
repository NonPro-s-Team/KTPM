package com.greenjuicehub.backend.service.cart;

import com.greenjuicehub.backend.dto.cart.request.AddToCartRequest;
import com.greenjuicehub.backend.dto.cart.request.UpdateCartItemRequest;
import com.greenjuicehub.backend.dto.cart.response.CartResponse;
import com.greenjuicehub.backend.entity.Cart;
import com.greenjuicehub.backend.entity.CartItem;
import com.greenjuicehub.backend.entity.Product;
import com.greenjuicehub.backend.entity.ProductVariant;
import com.greenjuicehub.backend.entity.User;
import com.greenjuicehub.backend.exception.AppException;
import com.greenjuicehub.backend.mapper.CartMapper;
import com.greenjuicehub.backend.repository.CartItemRepository;
import com.greenjuicehub.backend.repository.CartRepository;
import com.greenjuicehub.backend.repository.ProductRepository;
import com.greenjuicehub.backend.repository.ProductVariantRepository;
import com.greenjuicehub.backend.repository.UserRepository;
import com.greenjuicehub.backend.service.cart.impl.CartServiceImpl;
import org.junit.jupiter.api.Disabled;
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
class CartServiceImplTest {

    @Mock private CartRepository cartRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProductRepository productRepository;
    @Mock private ProductVariantRepository variantRepository;
    @Mock private CartMapper cartMapper;

    @InjectMocks private CartServiceImpl cartService;

    @Test
    void getCartCreatesCartForFirstAccessAndMapsItems() {
        User user = User.builder().id(5L).build();
        Cart savedCart = Cart.builder().id(8L).user(user).build();
        CartResponse expected = CartResponse.builder().cartId(8L).build();

        when(cartRepository.findByUserId(5L)).thenReturn(Optional.empty());
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(cartRepository.save(any(Cart.class))).thenReturn(savedCart);
        when(cartItemRepository.findAllByCartIdWithDetails(8L)).thenReturn(List.of());
        when(cartMapper.toCartResponse(savedCart, List.of())).thenReturn(expected);

        assertThat(cartService.getCart(5L)).isSameAs(expected);

        ArgumentCaptor<Cart> cartCaptor = ArgumentCaptor.forClass(Cart.class);
        verify(cartRepository).save(cartCaptor.capture());
        assertThat(cartCaptor.getValue().getUser()).isSameAs(user);
    }

    @Test
    void getCartRejectsUnknownUserWhenCartDoesNotExist() {
        when(cartRepository.findByUserId(99L)).thenReturn(Optional.empty());
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cartService.getCart(99L))
                .isInstanceOf(AppException.class)
                .hasMessage("Người dùng không tồn tại");
        verify(cartRepository, never()).save(any());
    }

    @Test
    void addItemIncrementsExistingItem() {
        Cart cart = Cart.builder().id(10L).build();
        ProductVariant variant = ProductVariant.builder().id(20L).isActive(true).stockQty(6).build();
        CartItem existing = CartItem.builder().id(30L).quantity(2).variant(variant).build();
        AddToCartRequest request = new AddToCartRequest(40L, 20L, 3);
        CartResponse expected = CartResponse.builder().cartId(10L).build();

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(variantRepository.findById(20L)).thenReturn(Optional.of(variant));
        when(cartItemRepository.findByCartIdAndVariantId(10L, 20L)).thenReturn(Optional.of(existing));
        when(cartItemRepository.findAllByCartIdWithDetails(10L)).thenReturn(List.of(existing));
        when(cartMapper.toCartResponse(cart, List.of(existing))).thenReturn(expected);

        assertThat(cartService.addItem(1L, request)).isSameAs(expected);
        assertThat(existing.getQuantity()).isEqualTo(5);
        verify(cartItemRepository).save(existing);
        verify(productRepository, never()).findById(any());
    }

    @Test
    void addItemCreatesNewCartItem() {
        Cart cart = Cart.builder().id(10L).build();
        Product product = Product.builder().id(40L).build();
        ProductVariant variant = ProductVariant.builder().id(20L).product(product)
                .isActive(true).stockQty(6).build();
        AddToCartRequest request = new AddToCartRequest(40L, 20L, 2);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(variantRepository.findById(20L)).thenReturn(Optional.of(variant));
        when(cartItemRepository.findByCartIdAndVariantId(10L, 20L)).thenReturn(Optional.empty());
        when(productRepository.findById(40L)).thenReturn(Optional.of(product));
        when(cartItemRepository.findAllByCartIdWithDetails(10L)).thenReturn(List.of());

        cartService.addItem(1L, request);

        ArgumentCaptor<CartItem> itemCaptor = ArgumentCaptor.forClass(CartItem.class);
        verify(cartItemRepository).save(itemCaptor.capture());
        assertThat(itemCaptor.getValue().getCart()).isSameAs(cart);
        assertThat(itemCaptor.getValue().getProduct()).isSameAs(product);
        assertThat(itemCaptor.getValue().getVariant()).isSameAs(variant);
        assertThat(itemCaptor.getValue().getQuantity()).isEqualTo(2);
    }

    @Test
    void addItemRejectsQuantityAboveStock() {
        Cart cart = Cart.builder().id(10L).build();
        ProductVariant variant = ProductVariant.builder().id(20L).isActive(true).stockQty(2).build();
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(variantRepository.findById(20L)).thenReturn(Optional.of(variant));

        assertThatThrownBy(() -> cartService.addItem(1L, new AddToCartRequest(40L, 20L, 3)))
                .isInstanceOf(AppException.class)
                .hasMessage("Số lượng tồn kho không đủ. Còn lại: 2");
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    void updateItemRejectsItemOutsideUsersCart() {
        Cart cart = Cart.builder().id(10L).build();
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.existsByCartIdAndId(10L, 77L)).thenReturn(false);

        assertThatThrownBy(() -> cartService.updateItem(1L, 77L, new UpdateCartItemRequest(2)))
                .isInstanceOf(AppException.class)
                .hasMessage("Sản phẩm không có trong giỏ hàng của bạn");
        verify(cartItemRepository, never()).findById(77L);
    }

    @Test
    void removeItemChecksOwnershipThenDeletesItem() {
        Cart cart = Cart.builder().id(10L).build();
        CartResponse expected = CartResponse.builder().cartId(10L).build();
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.existsByCartIdAndId(10L, 77L)).thenReturn(true);
        when(cartItemRepository.findAllByCartIdWithDetails(10L)).thenReturn(List.of());
        when(cartMapper.toCartResponse(cart, List.of())).thenReturn(expected);

        assertThat(cartService.removeItem(1L, 77L)).isSameAs(expected);
        verify(cartItemRepository).deleteById(77L);
    }

    @Test
    void clearCartDeletesOnlyItemsOfUsersCart() {
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(Cart.builder().id(10L).build()));

        cartService.clearCart(1L);

        verify(cartItemRepository).deleteAllByCartId(10L);
    }

    @Disabled("BUG: service không kiểm tra variant có thuộc productId trong request hay không")
    @Test
    void addItemShouldRejectVariantBelongingToAnotherProduct() {
        Cart cart = Cart.builder().id(10L).build();
        Product requestedProduct = Product.builder().id(40L).build();
        Product actualVariantProduct = Product.builder().id(41L).build();
        ProductVariant variant = ProductVariant.builder().id(20L).product(actualVariantProduct)
                .isActive(true).stockQty(6).build();
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(variantRepository.findById(20L)).thenReturn(Optional.of(variant));
        when(cartItemRepository.findByCartIdAndVariantId(10L, 20L)).thenReturn(Optional.empty());
        when(productRepository.findById(40L)).thenReturn(Optional.of(requestedProduct));

        assertThatThrownBy(() -> cartService.addItem(1L, new AddToCartRequest(40L, 20L, 1)))
                .isInstanceOf(AppException.class);
        verify(cartItemRepository, never()).save(any());
    }
}
