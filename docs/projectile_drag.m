clear
close all

g = 9.8;

h = [3, 5, 7, 10, 15, 20, 30, 40, 50]; %round(logspace(log10(3), log10(50), 8));
a = logspace(-2, 2, 100)';

t = 1./sqrt(g*a) .* acosh(exp(a.*h));

colors = flip(turbo(length(h)+1),1);
figure
for i = 1:length(h)
    semilogy(t(:,i), a, DisplayName=['h = ', num2str(h(i))], LineWidth=1.5, Color=colors(i,:))
    hold on
end
grid on
xlim([0 10]);
xlabel("Time (s)")
ylabel("\alpha (1/m)")
legend(Location="northwest")