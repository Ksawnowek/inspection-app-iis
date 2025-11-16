USE [GHSerwis]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

ALTER VIEW [dbo].[v_Zadania]
AS
SELECT
    -- podstawowe ID
    ZNAG.ZNAG_Id AS vZNAG_Id,

    -- część z fun_ZadanieNagl
    RTRIM('KLIENT: ' + RTRIM(CAST(ZNAG.ZNAG_KlientNumer AS nchar(25))) + '   ' + ZNAG.ZNAG_KlientNazwa) AS vKlient,
    RTRIM(ZNAG.ZNAG_KlientAdres)   AS vZNAG_KlientAdres,
    RTRIM(ZNAG.ZNAG_KlientMiasto)  AS vZNAG_KlientMiasto,
    RTRIM(ZNAG.ZNAG_KlientPowiat)  AS vZNAG_KlientPowiat,
    RTRIM(ZNAG.ZNAG_KlientTelefon) AS vZNAG_KlientTelefon,
    ZNAG.ZNAG_KategoriaKod         AS vZNAG_KategoriaKod,
    RTRIM(ZTYP.ZTYP_Opis)          AS vZNAG_KategoriaOpis,
    ZNAG.ZNAG_Kontrakt             AS vZNAG_Kontrakt,
    ZNAG.ZNAG_TypPrzegladu         AS vZNAG_TypPrzegladu,
    ZNAG.ZNAG_Czestotliwosc        AS vZNAG_Czestotliwosc,
    RTRIM(ZNAG.ZNAG_Urzadzenie)    AS vZNAG_Urzadzenie,
    RTRIM(ZNAG.ZNAG_Tonaz)         AS vZNAG_Tonaz,
    CASE
        WHEN ZNAG.ZNAG_KategoriaKod = 'R' THEN 'Awaria: '
        WHEN ZNAG.ZNAG_KategoriaKod = 'T' THEN 'Prace różne'
        ELSE ''
    END + ' ' + RTRIM(ZNAG.ZNAG_AwariaNumer) AS vNumerZadInne,
    ZNAG.ZNAG_OkrGwar               AS vCzyGwarancja,
    ZNAG.ZNAG_DataPlanowana         AS vZNAG_DataPlanowana,
    ZNAG.ZNAG_DataWykonania         AS vZNAG_DataWykonania,
    ZNAG.ZNAG_Osoby                 AS vZNAG_Osoby,
    ZOP.ZOP_OpisPrac                AS vOpisPracInne,
    ZNAG.ZNAG_Uwagi                 AS vZNAG_Uwagi,
    ZNAG.ZNAG_GodzSwieta            AS vZNAG_GodzSwieta,
    ZNAG.ZNAG_GodzSobNoc            AS vZNAG_GodzSobNoc,
    ZNAG.ZNAG_GodzDojazdu           AS vZNAG_GodzDojazdu,
    ZNAG.ZNAG_GodzNaprawa           AS vZNAG_GodzNaprawa,
    ZNAG.ZNAG_GodzWyjazd            AS vZNAG_GodzWyjazd,
    ZNAG.ZNAG_GodzDieta             AS vZNAG_GodzDieta,
    ZNAG.ZNAG_GodzKm                AS vZNAG_GodzKm,
    ZNAG.ZNAG_KlientNazwisko        AS vZNAG_KlientNazwisko,
    ZNAG.ZNAG_KlientDzial           AS vZNAG_KlientDzial,
    ZNAG.ZNAG_KlientDataZatw        AS vZNAG_KlientDataZatw,

    -- część z fun_ZadanieInnePoz
    ROW_NUMBER() OVER (
        PARTITION BY ZMAT.ZMAT_ZNAGL_Id
        ORDER BY ZMAT.ZMAT_ProWinId
    ) AS vLp,
    ZMAT.ZMAT_Kod    AS vZMAT_Kod,
    ZMAT.ZMAT_Opis   AS vZMAT_Opis,
    ZMAT.ZMAT_Ilosc  AS vZMAT_Ilosc

FROM dbo.ZadanieNagl AS ZNAG
LEFT JOIN dbo.ZadanieTyp AS ZTYP
    ON ZNAG.ZNAG_KategoriaKod = ZTYP.ZTYP_Kod
LEFT JOIN dbo.ZadanieInneOpis AS ZOP
    ON ZOP.ZOP_ZNAGL_Id = ZNAG.ZNAG_Id
LEFT JOIN dbo.ZadanieInneMaterial AS ZMAT
    ON ZMAT.ZMAT_ZNAGL_Id = ZNAG.ZNAG_Id;
GO
