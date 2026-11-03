<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>

<div class="row">
    <div class="card">

        <!-- CARDS RESUMO -->
        <section class="cards">

            <div class="card-Inicio">
                <h3>Viagens publicadas</h3>
                <p class="numero">12</p>
                <span>+2 este mês</span>
            </div>

            <div class="card-Inicio">
                <h3>Reservas</h3>
                <p class="numero">248</p>
                <span>+18 esta semana</span>
            </div>

            <div class="card-Inicio">
                <h3>Lucro total</h3>
                <p class="numero">R$ 38.500</p>
                <span>+R$ 3.200</span>
            </div>

            <div class="card-Inicio">
                <h3>Avaliação média</h3>
                <p class="numero">4.7</p>
                <span>Baseado em clientes</span>
            </div>

        </section>

        <!-- TABELA -->
        <section class="area-tabela">

            <h2>Últimas viagens cadastradas</h2>

            <table>
                <thead>
                    <tr>
                        <th>Destino</th>
                        <th>Data</th>
                        <th>Ocupação</th>
                        <th>Avaliação</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>Trindade - GO</td>
                        <td>27/03/2026</td>
                        <td>
                            <div class="barra-ocupacao">
                                <div style="width:90%"></div>
                            </div>
                            38 / 42
                        </td>
                        <td>4.8</td>
                        <td><span class="status">Ativa</span></td>
                    </tr>

                    <tr>
                        <td>Aparecida do Norte</td>
                        <td>15/04/2026</td>
                        <td>
                            <div class="barra-ocupacao">
                                <div style="width:65%"></div>
                            </div>
                            26 / 40
                        </td>
                        <td>4.6</td>
                        <td><span class="status">Ativa</span></td>
                    </tr>
                </tbody>
            </table>

        </section>

    </div>
</div>
