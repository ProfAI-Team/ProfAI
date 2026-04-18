import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, ShoppingCart, ShieldCheck } from 'lucide-react';

import { marketplaceService } from '../services/marketplaceService';
import PriceTag from '../components/b2b/PriceTag';
import RatingStars from '../components/b2b/RatingStars';
import MarkdownRenderer from '../components/MarkdownRenderer';

const MarketplaceItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const itemQuery = useQuery({
    queryKey: ['marketplace', 'item', id],
    queryFn: () => marketplaceService.get(id as string),
    enabled: Boolean(id),
  });

  const purchaseMutation = useMutation({
    mutationFn: () => marketplaceService.purchase(id as string),
    onSuccess: ({ checkoutUrl }) => {
      window.location.href = checkoutUrl;
    },
  });

  if (itemQuery.isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-6 h-6 mx-auto text-primary animate-spin" />
      </div>
    );
  }
  if (!itemQuery.data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-xl font-semibold">Ürün bulunamadı</h1>
        <button
          type="button"
          onClick={() => navigate('/marketplace')}
          className="btn-secondary mt-4"
        >
          Marketplace'e dön
        </button>
      </div>
    );
  }

  const item = itemQuery.data;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <header className="card-base p-6">
        <span className="text-[11px] font-medium uppercase tracking-wide text-primary">
          {item.type === 'notes' ? 'Notlar' : 'Çalışma rehberi'}
        </span>
        <h1 className="font-display text-2xl font-bold mt-1">{item.title}</h1>
        <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
          <RatingStars rating={item.rating} sampleSize={item.totalSales} />
          <PriceTag priceTl={item.price} size="lg" />
        </div>
      </header>

      <section className="card-base p-6">
        <h2 className="font-display font-semibold mb-3">Açıklama</h2>
        <MarkdownRenderer
          className="prose prose-sm dark:prose-invert max-w-none"
          markdown={item.description}
        />
      </section>

      {item.previewText && (
        <section className="card-base p-6">
          <h2 className="font-display font-semibold mb-3">Önizleme</h2>
          <p className="text-sm whitespace-pre-wrap text-foreground">
            {item.previewText}
          </p>
        </section>
      )}

      <section className="card-base p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Güvenli satın alma</p>
            <p className="mt-1">
              Ödeme iyzico 3D Secure üzerinden alınır. Kart bilgin bizde saklanmaz.
              Satın alma sonrası indirme linkini hesabından alırsın.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn-primary w-full mt-4"
          disabled={purchaseMutation.isPending}
          onClick={() => purchaseMutation.mutate()}
        >
          {purchaseMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ShoppingCart className="w-4 h-4" />
          )}
          Satın al — ₺{item.price}
        </button>
        {purchaseMutation.isError && (
          <p className="text-sm text-red-500 mt-3">
            {(purchaseMutation.error as Error).message}
          </p>
        )}
      </section>
    </div>
  );
};

export default MarketplaceItemPage;
